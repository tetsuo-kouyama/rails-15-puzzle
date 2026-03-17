module PuzzlesHelper
  def puzzle_i18n
    {
      startButton: t("puzzles.show.start_button"),
      resetButton: t("puzzles.show.reset_button"),
      clearMessage: t("puzzles.show.clear_message"),
      saveError: t("puzzles.messages.save_error"),
      networkError: t("puzzles.messages.network_error")
    }.to_json
  end
end
