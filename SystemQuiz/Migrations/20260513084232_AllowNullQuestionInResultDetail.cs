using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SystemQuiz.Migrations
{
    /// <inheritdoc />
    public partial class AllowNullQuestionInResultDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResultDetails_Answers_AnwserId",
                table: "ResultDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ResultDetails_Questions_QuestionId",
                table: "ResultDetails");

            migrationBuilder.AlterColumn<int>(
                name: "QuestionId",
                table: "ResultDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "AnwserId",
                table: "ResultDetails",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_ResultDetails_Answers_AnwserId",
                table: "ResultDetails",
                column: "AnwserId",
                principalTable: "Answers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ResultDetails_Questions_QuestionId",
                table: "ResultDetails",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ResultDetails_Answers_AnwserId",
                table: "ResultDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_ResultDetails_Questions_QuestionId",
                table: "ResultDetails");

            migrationBuilder.AlterColumn<int>(
                name: "QuestionId",
                table: "ResultDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AnwserId",
                table: "ResultDetails",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ResultDetails_Answers_AnwserId",
                table: "ResultDetails",
                column: "AnwserId",
                principalTable: "Answers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ResultDetails_Questions_QuestionId",
                table: "ResultDetails",
                column: "QuestionId",
                principalTable: "Questions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
