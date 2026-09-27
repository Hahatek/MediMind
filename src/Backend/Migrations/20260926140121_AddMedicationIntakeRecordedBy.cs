using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicationIntakeRecordedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RecordedByUserId",
                table: "MedicationIntakes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicationIntakes_RecordedByUserId",
                table: "MedicationIntakes",
                column: "RecordedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationIntakes_Users_RecordedByUserId",
                table: "MedicationIntakes",
                column: "RecordedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationIntakes_Users_RecordedByUserId",
                table: "MedicationIntakes");

            migrationBuilder.DropIndex(
                name: "IX_MedicationIntakes_RecordedByUserId",
                table: "MedicationIntakes");

            migrationBuilder.DropColumn(
                name: "RecordedByUserId",
                table: "MedicationIntakes");
        }
    }
}
