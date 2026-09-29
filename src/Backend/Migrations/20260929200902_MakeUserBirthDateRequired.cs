using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class MakeUserBirthDateRequired : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Celowo BEZ defaultValue (EF wygenerował 0001-01-01 = fikcyjna data -> AgeCategory Senior).
            // Jeśli w bazie jest User bez BirthDate, migracja ma się przerwać — dane trzeba uzupełnić
            // albo usunąć ręcznie, zanim ją zastosujemy (dev: konto testowe Alicja, czyszczenie bazy).
            migrationBuilder.AlterColumn<DateOnly>(
                name: "BirthDate",
                table: "Users",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateOnly),
                oldType: "date",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateOnly>(
                name: "BirthDate",
                table: "Users",
                type: "date",
                nullable: true,
                oldClrType: typeof(DateOnly),
                oldType: "date");
        }
    }
}
