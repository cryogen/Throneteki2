using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Throneteki.Data.Migrations
{
    public partial class AddGames : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "label",
                table: "cards",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "games",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    game_id = table.Column<Guid>(type: "uuid", nullable: false),
                    started_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    finished_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    winner_id = table.Column<string>(type: "text", nullable: true),
                    win_reason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_games", x => x.id);
                    table.ForeignKey(
                        name: "fk_games_users_winner_id",
                        column: x => x.winner_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "game_player",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    player_id = table.Column<string>(type: "text", nullable: false),
                    faction_id = table.Column<int>(type: "integer", nullable: false),
                    agenda_id = table.Column<int>(type: "integer", nullable: true),
                    total_power = table.Column<int>(type: "integer", nullable: false),
                    game_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_game_player", x => x.id);
                    table.ForeignKey(
                        name: "fk_game_player_cards_agenda_id",
                        column: x => x.agenda_id,
                        principalTable: "cards",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_game_player_factions_faction_id",
                        column: x => x.faction_id,
                        principalTable: "factions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_game_player_games_game_id",
                        column: x => x.game_id,
                        principalTable: "games",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_game_player_users_player_id",
                        column: x => x.player_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_game_player_agenda_id",
                table: "game_player",
                column: "agenda_id");

            migrationBuilder.CreateIndex(
                name: "ix_game_player_faction_id",
                table: "game_player",
                column: "faction_id");

            migrationBuilder.CreateIndex(
                name: "ix_game_player_game_id",
                table: "game_player",
                column: "game_id");

            migrationBuilder.CreateIndex(
                name: "ix_game_player_player_id",
                table: "game_player",
                column: "player_id");

            migrationBuilder.CreateIndex(
                name: "ix_games_winner_id",
                table: "games",
                column: "winner_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "game_player");

            migrationBuilder.DropTable(
                name: "games");

            migrationBuilder.AlterColumn<string>(
                name: "label",
                table: "cards",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
