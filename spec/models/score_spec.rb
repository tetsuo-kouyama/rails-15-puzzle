require 'rails_helper'

RSpec.describe Score, type: :model do
  describe "バリデーション" do
    it "有効な属性（難易度8など）があれば保存できること" do
      score = FactoryBot.build(:score, difficulty: 8)
      expect(score).to be_valid
    end

    it "許可されていない難易度（99など）は保存できないこと" do
      score = FactoryBot.build(:score, difficulty: 99)
      expect(score).not_to be_valid
    end
  end

  describe ".valid_difficulty" do
    it "存在する難易度（文字列）を渡すと、数値にして返すこと" do
      expect(Score.valid_difficulty("15")).to eq(15)
    end

    it "存在する難易度（数値）を渡すと、そのまま数値を返すこと" do
      expect(Score.valid_difficulty(24)).to eq(24)
    end

    it "存在しない難易度を渡すと、デフォルト値（8）を返すこと" do
      default = Score::DIFFICULTY_CONFIG.keys.first
      expect(Score.valid_difficulty("999")).to eq(default)
    end

    it "nilを渡すと、デフォルト値（8）を返すこと" do
      default = Score::DIFFICULTY_CONFIG.keys.first
      expect(Score.valid_difficulty(nil)).to eq(default)
    end
  end
end
