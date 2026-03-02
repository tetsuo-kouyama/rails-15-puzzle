class PuzzlesController < ApplicationController
  def index
    @difficulties = Score::DIFFICULTY_CONFIG.keys
  end

  def show
    @difficulty = Score.valid_difficulty(params[:id])
    @grid_size = Score::DIFFICULTY_CONFIG[@difficulty]
  end
end
