class RemoveUserNameFromScores < ActiveRecord::Migration[7.2]
  def change
    remove_column :scores, :user_name, :string
  end
end
