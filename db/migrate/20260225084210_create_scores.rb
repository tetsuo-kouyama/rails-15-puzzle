class CreateScores < ActiveRecord::Migration[7.2]
  def change
    create_table :scores do |t|
      t.string :user_name
      t.integer :clear_time

      t.timestamps
    end
  end
end
