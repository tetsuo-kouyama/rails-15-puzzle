module PuzzlesHelper
  def puzzle_i18n
    {
      startButton: t("puzzles.show.start_button"),
      resetButton: t("puzzles.show.reset_button"),
      clearMessage: t("puzzles.show.clear_message")
    }.to_json
  end
end
