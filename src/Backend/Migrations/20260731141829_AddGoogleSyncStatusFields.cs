using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleSyncStatusFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleEventId",
                table: "MedicationSchedules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastSyncError",
                table: "MedicationSchedules",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SyncStatus",
                table: "MedicationSchedules",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LastSyncError",
                table: "Examinations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SyncStatus",
                table: "Examinations",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleEventId",
                table: "MedicationSchedules");

            migrationBuilder.DropColumn(
                name: "LastSyncError",
                table: "MedicationSchedules");

            migrationBuilder.DropColumn(
                name: "SyncStatus",
                table: "MedicationSchedules");

            migrationBuilder.DropColumn(
                name: "LastSyncError",
                table: "Examinations");

            migrationBuilder.DropColumn(
                name: "SyncStatus",
                table: "Examinations");
        }
    }
}
