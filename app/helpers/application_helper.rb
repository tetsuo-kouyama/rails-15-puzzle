module ApplicationHelper
  def board_background_style
    "background-image: url('#{asset_path('board.png')}');".html_safe
  end
end
