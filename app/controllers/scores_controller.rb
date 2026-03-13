class ScoresController < ApplicationController
  before_action :set_score, only: %i[ show edit update destroy ]

  def index
    @difficulty = Score.valid_difficulty(params[:difficulty])
    @difficulties = Score::DIFFICULTY_CONFIG.keys

    @scores = Score.where(difficulty: @difficulty)
                   .order(clear_time: :asc, created_at: :asc)
                   .limit(10)

    @last_score_id = session[:last_score_id]
    session.delete(:last_score_id)
  end

  def show
  end

  def new
    @score = Score.new
  end

  def edit
  end

  def create
    @score = Score.new(score_params)
    @score.user = current_user if current_user

    if @score.save
      scope = Score.where(difficulty: @score.difficulty)
      session[:last_score_id] = @score.id

      better_time_count = scope
        .where("clear_time < ?", @score.clear_time)
        .count

      same_time_better_date_count = scope
        .where(clear_time: @score.clear_time)
        .where("created_at < ?", @score.created_at)
        .count

      rank = better_time_count + same_time_better_date_count + 1

      render json: { rank: rank, time: @score.clear_time, id: @score.id }
    else
      render json: { status: "error" }, status: :unprocessable_entity
    end
  end

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

  def destroy
    @score.destroy!

    respond_to do |format|
      format.html { redirect_to scores_path, notice: "Score was successfully destroyed.", status: :see_other }
      format.json { head :no_content }
    end
  end

  private
    def set_score
      @score = Score.find(params[:id])
    end

    def score_params
      params.require(:score).permit(:clear_time, :difficulty)
    end
end
