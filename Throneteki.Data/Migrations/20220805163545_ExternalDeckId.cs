using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class ExternalDeckId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ExternalId",
                table: "Decks",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "Decks");
        }
    }
}
