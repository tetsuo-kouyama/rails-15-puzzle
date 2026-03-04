class SessionsController < ApplicationController
  # skip_before_action :require_login, only: %i[new create]

  def new; end

  def create
    user = User.find_by(name: params[:session][:name])

    if user
      session[:user_id] = user.id
      redirect_to root_path, notice: "#{user.name}としてログインしました"
    else
      # ユーザーが見つからない場合、新規登録へ促すか、エラーを出す
      flash.now[:alert] = "ユーザー名が登録されていません。新規登録してください。"
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path, status: :see_other, notice: "ログアウトしました"
  end
end
