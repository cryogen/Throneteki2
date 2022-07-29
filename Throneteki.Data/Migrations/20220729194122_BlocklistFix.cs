using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class BlocklistFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockListEntry_AspNetUsers_ThronetekiUserId",
                table: "BlockListEntry");

            migrationBuilder.AddForeignKey(
                name: "FK_BlockListEntry_AspNetUsers_ThronetekiUserId",
                table: "BlockListEntry",
                column: "ThronetekiUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BlockListEntry_AspNetUsers_ThronetekiUserId",
                table: "BlockListEntry");

            migrationBuilder.AddForeignKey(
                name: "FK_BlockListEntry_AspNetUsers_ThronetekiUserId",
                table: "BlockListEntry",
                column: "ThronetekiUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
