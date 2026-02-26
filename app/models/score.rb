class Score < ApplicationRecord
  validates :user_name, presence: true
  validates :clear_time, numericality: { greater_than: 0 }
end
