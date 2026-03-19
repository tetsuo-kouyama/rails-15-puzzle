class ApplicationController < ActionController::Base
  helper_method :current_user, :logged_in?

  def logged_in?
    current_user.present?
  end

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def require_login
    unless current_user
      flash[:error] = t("defaults.require_login")
      redirect_to login_path
    end
  end
end
