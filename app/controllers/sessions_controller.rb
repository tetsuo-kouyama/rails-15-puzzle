class SessionsController < ApplicationController
  def new; end

  def create
    if params[:session][:name].blank?
      flash.now[:error] = t(".blank")
      render :new, status: :unprocessable_entity and return
    end

    user = User.find_by(name: params[:session][:name])
    if user
      session[:user_id] = user.id
      redirect_to root_path, notice: t(".success", name: user.name)
    else
      # ユーザーが見つからない場合、新規登録へ促すか、エラーを出す
      flash.now[:error] = t(".failure")
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path, status: :see_other, notice: t(".success")
  end
end
