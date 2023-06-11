using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class GamePlayerDecks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_game_players_cards_agenda_id",
                table: "game_players");

            migrationBuilder.DropForeignKey(
                name: "fk_game_players_factions_faction_id",
                table: "game_players");

            migrationBuilder.DropIndex(
                name: "ix_game_players_agenda_id",
                table: "game_players");

            migrationBuilder.DropColumn(
                name: "agenda_id",
                table: "game_players");

            migrationBuilder.RenameColumn(
                name: "faction_id",
                table: "game_players",
                newName: "deck_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_faction_id",
                table: "game_players",
                newName: "ix_game_players_deck_id");

            migrationBuilder.AddForeignKey(
                name: "fk_game_players_decks_deck_id",
                table: "game_players",
                column: "deck_id",
                principalTable: "decks",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_game_players_decks_deck_id",
                table: "game_players");

            migrationBuilder.RenameColumn(
                name: "deck_id",
                table: "game_players",
                newName: "faction_id");

            migrationBuilder.RenameIndex(
                name: "ix_game_players_deck_id",
                table: "game_players",
                newName: "ix_game_players_faction_id");

            migrationBuilder.AddColumn<int>(
                name: "agenda_id",
                table: "game_players",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_game_players_agenda_id",
                table: "game_players",
                column: "agenda_id");

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
        }
    }
}
