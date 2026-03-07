module PuzzlesHelper
  def puzzle_i18n
    {
      startButton: t("puzzles.show.start_button"),
      resetButton: t("puzzles.show.reset_button")
    }.to_json
  end
end
