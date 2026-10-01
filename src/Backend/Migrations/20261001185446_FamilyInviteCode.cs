using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class FamilyInviteCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Stare zaproszenia (GUID, 7 dni, wielorazowe) nie mają kodu, więc nie da się ich użyć w v2 — usuwamy je
            // PRZED dodaniem wymaganej kolumny CodeHash (bez wartości domyślnej, żeby nie powstały wiersze z pustym hashem).
            migrationBuilder.Sql("DELETE FROM \"FamilyInvites\";");

            migrationBuilder.DropIndex(
                name: "IX_FamilyInvites_FamilyId",
                table: "FamilyInvites");

            migrationBuilder.AddColumn<string>(
                name: "CodeHash",
                table: "FamilyInvites",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ConsumedAt",
                table: "FamilyInvites",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ConsumedByUserId",
                table: "FamilyInvites",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvites_CodeHash_Live",
                table: "FamilyInvites",
                column: "CodeHash",
                unique: true,
                filter: "\"ConsumedAt\" IS NULL AND \"RevokedAt\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvites_ConsumedByUserId",
                table: "FamilyInvites",
                column: "ConsumedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvites_FamilyId_Live",
                table: "FamilyInvites",
                column: "FamilyId",
                unique: true,
                filter: "\"ConsumedAt\" IS NULL AND \"RevokedAt\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyInvites_Users_ConsumedByUserId",
                table: "FamilyInvites",
                column: "ConsumedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyInvites_Users_ConsumedByUserId",
                table: "FamilyInvites");

            migrationBuilder.DropIndex(
                name: "IX_FamilyInvites_CodeHash_Live",
                table: "FamilyInvites");

            migrationBuilder.DropIndex(
                name: "IX_FamilyInvites_ConsumedByUserId",
                table: "FamilyInvites");

            migrationBuilder.DropIndex(
                name: "IX_FamilyInvites_FamilyId_Live",
                table: "FamilyInvites");

            migrationBuilder.DropColumn(
                name: "CodeHash",
                table: "FamilyInvites");

            migrationBuilder.DropColumn(
                name: "ConsumedAt",
                table: "FamilyInvites");

            migrationBuilder.DropColumn(
                name: "ConsumedByUserId",
                table: "FamilyInvites");

            migrationBuilder.CreateIndex(
                name: "IX_FamilyInvites_FamilyId",
                table: "FamilyInvites",
                column: "FamilyId");
        }
    }
}
