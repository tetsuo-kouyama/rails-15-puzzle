class ScoresController < ApplicationController
  before_action :set_score, only: %i[ show edit update destroy ]

  # GET /scores or /scores.json
  def index
    @difficulty = Score.valid_difficulty(params[:difficulty])
    @difficulties = Score::DIFFICULTY_CONFIG.keys

    @scores = Score.where(difficulty: @difficulty)
                   .order(clear_time: :asc, created_at: :asc)
                   .limit(10)
  end

  # GET /scores/1 or /scores/1.json
  def show
  end

  # GET /scores/new
  def new
    @score = Score.new
  end

  # GET /scores/1/edit
  def edit
  end

  # POST /scores or /scores.json
  def create
    @score = Score.new(score_params)
    respond_to do |format|
      if @score.save
        format.json { render json: @score, status: :created }
        format.html { redirect_to scores_path, notice: "保存しました" }
      else
        format.json { render json: @score.errors, status: :unprocessable_entity }
        format.html { render :new }
      end
    end
  end

  # PATCH/PUT /scores/1 or /scores/1.json
  def update
    respond_to do |format|
      if @score.update(score_params)
        format.html { redirect_to @score, notice: "Score was successfully updated.", status: :see_other }
        format.json { render :show, status: :ok, location: @score }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @score.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /scores/1 or /scores/1.json
  def destroy
    @score.destroy!

    respond_to do |format|
      format.html { redirect_to scores_path, notice: "Score was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_score
      @score = Score.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def score_params
      params.require(:score).permit(:user_name, :clear_time, :difficulty)
    end
end
