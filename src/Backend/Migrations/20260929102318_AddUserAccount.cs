using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_Email",
                table: "UserAccounts",
                column: "Email",
                unique: true);

            // Backfill: każdy istniejący User z hasłem dostaje konto z tym samym Id, emailem i hashem.
            // User bez hasła i tak nie mógł się zalogować (Login odrzuca PasswordHash == null), więc go pomijamy.
            // CreatedAt = moment migracji (User nie ma daty utworzenia). Kolumny legacy w Users zostają.
            migrationBuilder.Sql("""
                INSERT INTO "UserAccounts" ("UserId", "Email", "PasswordHash", "CreatedAt")
                SELECT "Id", "Email", "PasswordHash", now()
                FROM "Users"
                WHERE "PasswordHash" IS NOT NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserAccounts");
        }
    }
}
