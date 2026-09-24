using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddExaminationHide : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExaminationsHide",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExaminationId = table.Column<Guid>(type: "uuid", nullable: false),
                    HiddenForUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    HiddenByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExaminationsHide", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExaminationsHide_Examinations_ExaminationId",
                        column: x => x.ExaminationId,
                        principalTable: "Examinations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExaminationsHide_Users_HiddenByUserId",
                        column: x => x.HiddenByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExaminationsHide_Users_HiddenForUserId",
                        column: x => x.HiddenForUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExaminationsHide_ExaminationId_HiddenForUserId",
                table: "ExaminationsHide",
                columns: new[] { "ExaminationId", "HiddenForUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExaminationsHide_HiddenByUserId",
                table: "ExaminationsHide",
                column: "HiddenByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExaminationsHide_HiddenForUserId",
                table: "ExaminationsHide",
                column: "HiddenForUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExaminationsHide");
        }
    }
}
