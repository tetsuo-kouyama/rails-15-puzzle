class AddDifficultyToScores < ActiveRecord::Migration[7.2]
  def change
    add_column :scores, :difficulty, :integer
    add_index :scores, :difficulty
  end
end
