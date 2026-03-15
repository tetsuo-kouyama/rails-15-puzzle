namespace :db_cleanup do
  desc "ランキングをリセット(scoresを削除)"
  task reset_scores: :environment do
    Score.delete_all
    puts "全スコアを削除しました"
  end


  desc "テストユーザ削除"
  task remove_test_users: :environment do
    test_users = [ "test" ]  # 削除したいユーザー名を入れる

    test_users.each do |name|
      user = User.find_by(name: name)

      if user
        user.destroy!
        puts "#{name}を削除しました"
      else
        puts "#{name}は存在しません"
      end
    end
  end


  desc "ランキング完全リセット"
  task reset_ranking: :environment do
    puts "ランキングをリセットします..."

    Score.delete_all
    puts "スコア削除"

    test_users = [ "test" ]

    test_users.each do |name|
      user = User.find_by(name: name)
      user.destroy if user
    end

    puts "テストユーザー削除"
  end
end
