using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGuardianship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Guardianships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GuardianUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    WardUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guardianships", x => x.Id);
                    table.CheckConstraint("CK_Guardianships_GuardianNotWard", "\"GuardianUserId\" <> \"WardUserId\"");
                    table.ForeignKey(
                        name: "FK_Guardianships_Users_GuardianUserId",
                        column: x => x.GuardianUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Guardianships_Users_WardUserId",
                        column: x => x.WardUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Guardianships_GuardianUserId_WardUserId",
                table: "Guardianships",
                columns: new[] { "GuardianUserId", "WardUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Guardianships_WardUserId_Primary",
                table: "Guardianships",
                column: "WardUserId",
                unique: true,
                filter: "\"IsPrimary\"");

            // Backfill legacy (reguła D): każda para, która dziś przechodzi IsParentOfChildAsync,
            // czyli (IsParent w rodzinie F, członek F z Role = Child), dostaje wiersz Guardianship.
            // Pomijamy pary "sam sobie opiekunem" i opiekunów z Role = Child (np. dziecko-owner własnej rodziny).
            // IsPrimary = true tylko, gdy wśród opiekunów dziecka jest dokładnie jeden owner rodziny,
            // do której dziecko należy. Inaczej wszyscy opiekunowie dostają IsPrimary = false
            // (legacy/migration exception, NIE dozwolony stan dla nowych ManagedProfile).
            // Role: 0 = Child (RoleUser).
            migrationBuilder.Sql("""
                WITH pairs AS (
                    SELECT DISTINCT pm."UserId" AS guardian_id, cm."UserId" AS ward_id
                    FROM "FamilyMemberships" pm
                    JOIN "FamilyMemberships" cm ON cm."FamilyId" = pm."FamilyId"
                    JOIN "Users" g ON g."Id" = pm."UserId"
                    JOIN "Users" w ON w."Id" = cm."UserId"
                    WHERE pm."IsParent"
                      AND w."Role" = 0
                      AND g."Role" <> 0
                      AND pm."UserId" <> cm."UserId"
                ),
                primary_candidates AS (
                    SELECT DISTINCT p.ward_id, p.guardian_id
                    FROM pairs p
                    JOIN "FamilyMemberships" om ON om."UserId" = p.guardian_id AND om."IsOwner"
                    JOIN "FamilyMemberships" wm ON wm."UserId" = p.ward_id AND wm."FamilyId" = om."FamilyId"
                ),
                unambiguous_primary AS (
                    SELECT ward_id, (array_agg(guardian_id))[1] AS guardian_id
                    FROM primary_candidates
                    GROUP BY ward_id
                    HAVING count(*) = 1
                )
                INSERT INTO "Guardianships" ("Id", "GuardianUserId", "WardUserId", "IsPrimary", "CreatedAt")
                SELECT gen_random_uuid(), p.guardian_id, p.ward_id, (up.ward_id IS NOT NULL), now()
                FROM pairs p
                LEFT JOIN unambiguous_primary up ON up.ward_id = p.ward_id AND up.guardian_id = p.guardian_id;
                """);

            // Zapytanie kontrolne (nie tworzymy tabeli raportu) — podopieczni z opiekunami, ale bez Primary.
            // Każdy wynik to legacy exception albo bug; nowe operacje nie mogą tworzyć takiego stanu:
            //
            //   SELECT w."Id", w."FirstName", w."LastName", count(*) AS guardians
            //   FROM "Guardianships" g JOIN "Users" w ON w."Id" = g."WardUserId"
            //   GROUP BY w."Id", w."FirstName", w."LastName"
            //   HAVING NOT bool_or(g."IsPrimary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Guardianships");
        }
    }
}
