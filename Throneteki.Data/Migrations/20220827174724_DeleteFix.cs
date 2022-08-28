using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class DeleteFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_lobby_messages_users_deleted_by_id",
                table: "lobby_messages");

            migrationBuilder.AlterColumn<string>(
                name: "deleted_by_id",
                table: "lobby_messages",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "fk_lobby_messages_users_deleted_by_id",
                table: "lobby_messages",
                column: "deleted_by_id",
                principalTable: "users",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_lobby_messages_users_deleted_by_id",
                table: "lobby_messages");

            migrationBuilder.AlterColumn<string>(
                name: "deleted_by_id",
                table: "lobby_messages",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_lobby_messages_users_deleted_by_id",
                table: "lobby_messages",
                column: "deleted_by_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
