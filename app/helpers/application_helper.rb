module ApplicationHelper
  def board_background_style
    "background-image: url('#{asset_path('board.png')}');".html_safe
  end

  def format_time(seconds)
    seconds = seconds.to_i
    min = seconds / 60
    sec = seconds % 60
    format("%02d:%02d", min, sec)
  end

  def page_title(title = "")
    base_title = "Ancient Grid"
    title.present? ? "#{title} | #{base_title}" : base_title
  end
end
