using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class ExtendMedicationModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationIntakes_MedicationSchedules_MedicationScheduleId",
                table: "MedicationIntakes");

            // Istniejące pory dotyczyły jednej sztuki leku — domyślnie 1, a nie 0
            migrationBuilder.AddColumn<decimal>(
                name: "Amount",
                table: "MedicationSchedules",
                type: "numeric(8,2)",
                precision: 8,
                scale: 2,
                nullable: false,
                defaultValue: 1m);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Medications",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<DateOnly>(
                name: "DiscontinuedOn",
                table: "Medications",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Form",
                table: "Medications",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Medications",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Strength",
                table: "Medications",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "ScheduledTime",
                table: "MedicationIntakes",
                type: "time without time zone",
                nullable: true);

            // Przeniesienie danych: stare Dose (liczba bez jednostki) -> Strength jako tekst.
            // Postać nie była zapisywana, więc istniejące leki dostają "tabletka" (do poprawienia w aplikacji).
            migrationBuilder.Sql("""UPDATE "Medications" SET "Strength" = "Dose"::text, "Form" = 'tabletka';""");

            // Stara historia: godzina z harmonogramu, jaka obowiązuje w chwili migracji
            migrationBuilder.Sql("""
                UPDATE "MedicationIntakes" AS mi SET "ScheduledTime" = ms."Time"
                FROM "MedicationSchedules" AS ms
                WHERE mi."MedicationScheduleId" = ms."Id";
                """);

            // Dose usuwamy dopiero po przeniesieniu danych do Strength
            migrationBuilder.DropColumn(
                name: "Dose",
                table: "Medications");

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationIntakes_MedicationSchedules_MedicationScheduleId",
                table: "MedicationIntakes",
                column: "MedicationScheduleId",
                principalTable: "MedicationSchedules",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationIntakes_MedicationSchedules_MedicationScheduleId",
                table: "MedicationIntakes");

            migrationBuilder.AddColumn<double>(
                name: "Dose",
                table: "Medications",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            // Odwrotne przeniesienie tylko tam, gdzie Strength jest samą liczbą (np. "5"); reszta dostaje 0
            migrationBuilder.Sql("""
                UPDATE "Medications" SET "Dose" = CASE
                    WHEN "Strength" ~ '^[0-9]+(\.[0-9]+)?$' THEN "Strength"::double precision
                    ELSE 0 END;
                """);

            migrationBuilder.DropColumn(
                name: "Amount",
                table: "MedicationSchedules");

            migrationBuilder.DropColumn(
                name: "DiscontinuedOn",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "Form",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "Strength",
                table: "Medications");

            migrationBuilder.DropColumn(
                name: "ScheduledTime",
                table: "MedicationIntakes");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Medications",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationIntakes_MedicationSchedules_MedicationScheduleId",
                table: "MedicationIntakes",
                column: "MedicationScheduleId",
                principalTable: "MedicationSchedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
