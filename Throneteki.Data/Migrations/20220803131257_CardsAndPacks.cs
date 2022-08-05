using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class CardsAndPacks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Factions",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Cards",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Claim",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Cards",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Income",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Initiative",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "Intrigue",
                table: "Cards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Military",
                table: "Cards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Power",
                table: "Cards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "Reserve",
                table: "Cards",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Factions_Code",
                table: "Factions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cards_Code",
                table: "Cards",
                column: "Code",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Factions_Code",
                table: "Factions");

            migrationBuilder.DropIndex(
                name: "IX_Cards_Code",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Claim",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Income",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Initiative",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Intrigue",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Military",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Power",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "Reserve",
                table: "Cards");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Factions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Cards",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
