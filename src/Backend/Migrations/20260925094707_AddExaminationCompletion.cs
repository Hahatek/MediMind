using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExaminationCompletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Examinations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CompletedByUserId",
                table: "Examinations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Examinations_CompletedByUserId",
                table: "Examinations",
                column: "CompletedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Examinations_Users_CompletedByUserId",
                table: "Examinations",
                column: "CompletedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Examinations_Users_CompletedByUserId",
                table: "Examinations");

            migrationBuilder.DropIndex(
                name: "IX_Examinations_CompletedByUserId",
                table: "Examinations");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Examinations");

            migrationBuilder.DropColumn(
                name: "CompletedByUserId",
                table: "Examinations");
        }
    }
}
