class PuzzlesController < ApplicationController
  ALLOWED_DIFFICULTIES = {
    "8"  => 3,
    "15" => 4,
    "24" => 5
  }.freeze

  def index
    @difficulties = ALLOWED_DIFFICULTIES.keys
  end

  def show
    unless ALLOWED_DIFFICULTIES.key?(params[:id])
      redirect_to root_path, alert: "無効な難易度です"
      return
    end

    @difficulty = params[:id]
    @grid_size = ALLOWED_DIFFICULTIES[@difficulty]
  end
end
