class PuzzlesController < ApplicationController
  def index
  end

  def show
    allowed = %w[8 15 24]
    
    unless allowed.include?(params[:id])
      redirect_to root_path, alert: "無効な難易度です"
      return
    end

    @difficulty = params[:id].to_i
  end
end
