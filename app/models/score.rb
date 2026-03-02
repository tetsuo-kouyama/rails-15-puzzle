class Score < ApplicationRecord
  DIFFICULTY_CONFIG = {
    8  => 3,
    15 => 4,
    24 => 5
  }.freeze

  def self.valid_difficulty(value)
    difficulty = value.to_i
    DIFFICULTY_CONFIG.key?(difficulty) ? difficulty : DIFFICULTY_CONFIG.keys.first
  end

  validates :user_name, presence: true
  validates :clear_time, numericality: { greater_than: 0 }
  validates :difficulty, presence: true, inclusion: { in: DIFFICULTY_CONFIG.keys }
end
