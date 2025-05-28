using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ShopApp.Persistence.Migrations
{
    public partial class AddUserTypeToUser : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserType",
                table: "ApplicationUsers");

            migrationBuilder.AddColumn<string>(
                name: "UserType",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "User");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserType",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "UserType",
                table: "ApplicationUsers",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
