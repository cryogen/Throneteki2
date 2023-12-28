using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOpenIddict : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "type",
                table: "open_iddict_applications",
                newName: "settings");

            migrationBuilder.AddColumn<string>(
                name: "application_type",
                table: "open_iddict_applications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "client_type",
                table: "open_iddict_applications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "json_web_key_set",
                table: "open_iddict_applications",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "application_type",
                table: "open_iddict_applications");

            migrationBuilder.DropColumn(
                name: "client_type",
                table: "open_iddict_applications");

            migrationBuilder.DropColumn(
                name: "json_web_key_set",
                table: "open_iddict_applications");

            migrationBuilder.RenameColumn(
                name: "settings",
                table: "open_iddict_applications",
                newName: "type");
        }
    }
}
