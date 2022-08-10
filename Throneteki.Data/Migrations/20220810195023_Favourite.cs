using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class Favourite : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsFavourite",
                table: "Decks",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsFavourite",
                table: "Decks");
        }
    }
}
