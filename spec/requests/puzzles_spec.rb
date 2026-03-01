require 'rails_helper'

RSpec.describe "Puzzles" do
  describe "GET /puzzles/:id" do
    context "有効な難易度の場合" do
      it "8パズル(3x3)が正常に表示されること" do
        get "/puzzles/8"
        expect(response).to have_http_status(:success)
        # 画面内に '8パズル' という文字があるか確認
        expect(response.body).to include("8パズル")
      end

      it "15パズル(4x4)が正常に表示されること" do
        get "/puzzles/15"
        expect(response).to have_http_status(:success)
      end
    end

    context "無効な難易度の場合" do
      it "数値以外のID(abc)でアクセスするとトップページへリダイレクトされること" do
        get "/puzzles/abc"
        expect(response).to redirect_to(root_path)
      end

      it "定義されていない数値(99)でアクセスするとトップページへリダイレクトされること" do
        get "/puzzles/99"
        expect(response).to redirect_to(root_path)
        expect(flash[:alert]).to eq "無効な難易度です"
      end
    end
  end
end
