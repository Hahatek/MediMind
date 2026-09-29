using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIntakeScheduledAmount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ScheduledAmount",
                table: "MedicationIntakes",
                type: "numeric(8,2)",
                precision: 8,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            // Stara historia: ilość z harmonogramu, jaka obowiązuje w chwili migracji
            migrationBuilder.Sql("""
                UPDATE "MedicationIntakes" AS mi SET "ScheduledAmount" = ms."Amount"
                FROM "MedicationSchedules" AS ms
                WHERE mi."MedicationScheduleId" = ms."Id";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScheduledAmount",
                table: "MedicationIntakes");
        }
    }
}
