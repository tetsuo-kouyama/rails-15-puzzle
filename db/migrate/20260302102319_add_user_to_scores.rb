class AddUserToScores < ActiveRecord::Migration[7.2]
  def change
    add_reference :scores, :user, foreign_key: true
  end
end
