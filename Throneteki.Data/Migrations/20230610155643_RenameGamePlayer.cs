using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class RenameGamePlayer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_game_player_cards_agenda_id",
                table: "game_player");

            migrationBuilder.DropForeignKey(
                name: "fk_game_player_factions_faction_id",
                table: "game_player");

            migrationBuilder.DropForeignKey(
                name: "fk_game_player_games_game_id",
                table: "game_player");

            migrationBuilder.DropForeignKey(
                name: "fk_game_player_users_player_id",
                table: "game_player");

            migrationBuilder.DropPrimaryKey(
                name: "pk_game_player",
                table: "game_player");

            migrationBuilder.RenameTable(
                name: "game_player",
                newName: "game_players");

            migrationBuilder.RenameIndex(
                name: "ix_game_player_player_id",
                table: "game_players",
                newName: "ix_game_players_player_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_player_game_id",
                table: "game_players",
                newName: "ix_game_players_game_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_player_faction_id",
                table: "game_players",
                newName: "ix_game_players_faction_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_player_agenda_id",
                table: "game_players",
                newName: "ix_game_players_agenda_id");

            migrationBuilder.AlterColumn<int>(
                name: "game_id",
                table: "game_players",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "pk_game_players",
                table: "game_players",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_players_cards_agenda_id",
                table: "game_players",
                column: "agenda_id",
                principalTable: "cards",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_players_factions_faction_id",
                table: "game_players",
                column: "faction_id",
                principalTable: "factions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_game_players_games_game_id",
                table: "game_players",
                column: "game_id",
                principalTable: "games",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_game_players_users_player_id",
                table: "game_players",
                column: "player_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_game_players_cards_agenda_id",
                table: "game_players");

            migrationBuilder.DropForeignKey(
                name: "fk_game_players_factions_faction_id",
                table: "game_players");

            migrationBuilder.DropForeignKey(
                name: "fk_game_players_games_game_id",
                table: "game_players");

            migrationBuilder.DropForeignKey(
                name: "fk_game_players_users_player_id",
                table: "game_players");

            migrationBuilder.DropPrimaryKey(
                name: "pk_game_players",
                table: "game_players");

            migrationBuilder.RenameTable(
                name: "game_players",
                newName: "game_player");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_player_id",
                table: "game_player",
                newName: "ix_game_player_player_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_game_id",
                table: "game_player",
                newName: "ix_game_player_game_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_faction_id",
                table: "game_player",
                newName: "ix_game_player_faction_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_agenda_id",
                table: "game_player",
                newName: "ix_game_player_agenda_id");

            migrationBuilder.AlterColumn<int>(
                name: "game_id",
                table: "game_player",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "pk_game_player",
                table: "game_player",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_player_cards_agenda_id",
                table: "game_player",
                column: "agenda_id",
                principalTable: "cards",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_player_factions_faction_id",
                table: "game_player",
                column: "faction_id",
                principalTable: "factions",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_game_player_games_game_id",
                table: "game_player",
                column: "game_id",
                principalTable: "games",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_player_users_player_id",
                table: "game_player",
                column: "player_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
