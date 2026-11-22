import os
from PIL import Image, ImageDraw, ImageFont

def create_invoice():
    # 고해상도 A4 비율 이미지 생성 (1200 x 1700)
    width, height = 1200, 1700
    img = Image.new("RGB", (width, height), "#ffffff")
    draw = ImageDraw.Draw(img)

    # 폰트 로드
    font_path = "C:/Windows/Fonts/malgun.ttf"
    font_bold_path = "C:/Windows/Fonts/malgunbd.ttf"
    
    font_title = ImageFont.truetype(font_bold_path, 42)
    font_h2 = ImageFont.truetype(font_bold_path, 22)
    font_bold = ImageFont.truetype(font_bold_path, 18)
    font_normal = ImageFont.truetype(font_path, 16)
    font_small = ImageFont.truetype(font_path, 14)
    font_num = ImageFont.truetype(font_bold_path, 17)

    # 외곽 여백
    pad_x = 70
    pad_y = 60
    content_w = width - pad_x * 2

    # 배경 외곽 테두리 (연한 회색 박스 및 메인 선)
    draw.rectangle([pad_x, pad_y, width - pad_x, height - pad_y], outline="#1e293b", width=3)

    # 1. 상단 타이틀
    title_text = "거  래  명  세  표"
    bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = bbox[2] - bbox[0]
    draw.text(((width - t_w) / 2, pad_y + 25), title_text, fill="#0f172a", font=font_title)

    # 2. 날짜 및 공급받는자 / 공급자 영역 박스
    top_box_y = pad_y + 95
    top_box_h = 190
    draw.rectangle([pad_x, top_box_y, width - pad_x, top_box_y + top_box_h], outline="#334155", width=2)

    # 좌우 분할선 (좌측: 공급받는자 480px, 우측: 공급자 나머지)
    split_x = pad_x + 480
    draw.line([(split_x, top_box_y), (split_x, top_box_y + top_box_h)], fill="#334155", width=2)

    # [좌측: 공급받는 자 (살롱순라)]
    draw.text((pad_x + 25, top_box_y + 20), "2026 년  11 월  20 일", fill="#334155", font=font_h2)
    
    draw.text((pad_x + 25, top_box_y + 75), "살 롱 순 라", fill="#0f172a", font=ImageFont.truetype(font_bold_path, 32))
    draw.text((pad_x + 230, top_box_y + 85), "귀 하", fill="#334155", font=ImageFont.truetype(font_bold_path, 22))

    draw.text((pad_x + 25, top_box_y + 130), "배송지: 서울특별시 종로구 율곡로10길 75 (권농동)", fill="#475569", font=font_small)
    draw.text((pad_x + 25, top_box_y + 155), "아래와 같이 계산 청구합니다.", fill="#64748b", font=font_small)

    # [우측: 공급자 (유통사 정보)]
    # 세로 구분선 및 가로 행 분할
    sup_hdr_w = 40
    sup_lbl_w = 110
    draw.line([(split_x + sup_hdr_w, top_box_y), (split_x + sup_hdr_w, top_box_y + top_box_h)], fill="#cbd5e1", width=1)
    
    # "공급자" 세로 텍스트
    draw.text((split_x + 12, top_box_y + 40), "공\n\n급\n\n자", fill="#334155", font=font_bold)

    sup_info = [
        ("등록번호", "204-86-77891", True),
        ("상  호", "(주)한결푸드시스템", False),
        ("성  명", "김 대 한    (인)", False),
        ("사업장", "서울 동대문구 고산자로32길 12", False),
        ("업  태", "도·소매 / 식자재유통", False)
    ]

    row_h = top_box_h / 5
    for i, (label, val, is_b) in enumerate(sup_info):
        curr_y = top_box_y + i * row_h
        if i > 0:
            draw.line([(split_x + sup_hdr_w, curr_y), (width - pad_x, curr_y)], fill="#cbd5e1", width=1)
        
        lbl_x = split_x + sup_hdr_w
        draw.line([(lbl_x + sup_lbl_w, curr_y), (lbl_x + sup_lbl_w, curr_y + row_h)], fill="#cbd5e1", width=1)
        
        draw.text((lbl_x + 15, curr_y + 8), label, fill="#334155", font=font_bold if is_b else font_normal)
        draw.text((lbl_x + sup_lbl_w + 15, curr_y + 8), val, fill="#0f172a", font=font_bold if is_b else font_normal)

    # 붉은색 공급자 직인 도장 마크
    stamp_x = width - pad_x - 90
    stamp_y = top_box_y + row_h * 2 - 12
    draw.ellipse([stamp_x, stamp_y, stamp_x + 55, stamp_y + 55], outline="#ef4444", width=3)
    draw.text((stamp_x + 8, stamp_y + 10), "한결\n푸드", fill="#ef4444", font=ImageFont.truetype(font_bold_path, 14))

    # 3. 합계금액 밴드
    sum_box_y = top_box_y + top_box_h + 15
    sum_box_h = 55
    draw.rectangle([pad_x, sum_box_y, width - pad_x, sum_box_y + sum_box_h], fill="#f8fafc", outline="#334155", width=2)
    
    draw.text((pad_x + 25, sum_box_y + 14), "합 계 금 액 ( 공급가액 + 세액 )", fill="#334155", font=font_bold)
    total_price_str = "일백육십오만사천원정 ( ￦ 1,654,000 )"
    draw.text((pad_x + 400, sum_box_y + 14), total_price_str, fill="#0f172a", font=ImageFont.truetype(font_bold_path, 22))

    # 4. 품목 상세 테이블
    table_y = sum_box_y + sum_box_h + 15
    table_h = 750
    draw.rectangle([pad_x, table_y, width - pad_x, table_y + table_h], outline="#334155", width=2)

    # 컬럼 정의: (컬럼명, 너비, 정렬)
    cols = [
        ("월일", 70, "center"),
        ("품        목", 320, "left"),
        ("규    격", 200, "left"),
        ("수량", 80, "center"),
        ("단  가 (원)", 120, "right"),
        ("공 급 가 액 (원)", 150, "right"),
        ("세  액", 120, "right")
    ]

    # 헤더 행
    th_h = 42
    draw.rectangle([pad_x, table_y, width - pad_x, table_y + th_h], fill="#f1f5f9", outline="#334155", width=1)
    
    curr_x = pad_x
    col_x_list = [curr_x]
    for name, w, align in cols:
        next_x = curr_x + w
        col_x_list.append(next_x)
        # 텍스트 가운데 정렬
        bbox = draw.textbbox((0, 0), name, font=font_bold)
        tw = bbox[2] - bbox[0]
        draw.text((curr_x + (w - tw) / 2, table_y + 10), name, fill="#1e293b", font=font_bold)
        if next_x < width - pad_x:
            draw.line([(next_x, table_y), (next_x, table_y + table_h)], fill="#cbd5e1", width=1)
        curr_x = next_x

    # 살롱순라 납품 식자재 데이터 (총 8개 품목)
    items = [
        ("11/20", "소채끝등심", "미국산 초이스 냉장 10kg", "2 박스", "37,000", "740,000", "0"),
        ("11/20", "생모짜렐라 치즈", "이탈리아 갈바니 1kg", "10 팩", "18,000", "180,000", "18,000"),
        ("11/20", "와일드 루꼴라", "국내산 무농약 500g", "6 팩", "11,500", "69,000", "0"),
        ("11/20", "엑스트라버진 올리브유", "스페인 보르게스 5L", "2 캔", "105,000", "210,000", "21,000"),
        ("11/20", "파스타면 스파게티", "데체코 No.12 5kg", "4 백", "21,500", "86,000", "8,600"),
        ("11/20", "백명란젓 (파스타용)", "선명란 국내가공 1kg", "5 팩", "24,000", "120,000", "0"),
        ("11/20", "차돌박이 (구이/토핑용)", "미국산 초이스 냉동 1kg", "5 팩", "21,000", "105,000", "0"),
        ("11/20", "바질 페스토", "이탈리아산 1kg 병", "3 병", "28,000", "84,000", "8,400"),
    ]

    row_data_h = 50
    for idx in range(13): # 총 13행 (데이터 8행 + 빈 행 5행)
        r_y = table_y + th_h + idx * row_data_h
        draw.line([(pad_x, r_y), (width - pad_x, r_y)], fill="#e2e8f0", width=1)
        
        if idx < len(items):
            date_s, item_s, spec_s, qty_s, price_s, supply_s, tax_s = items[idx]
            
            # 날짜
            draw.text((col_x_list[0] + 15, r_y + 14), date_s, fill="#475569", font=font_normal)
            # 품목명 (강조)
            draw.text((col_x_list[1] + 15, r_y + 13), item_s, fill="#0f172a", font=font_bold)
            # 규격
            draw.text((col_x_list[2] + 15, r_y + 14), spec_s, fill="#475569", font=font_small)
            # 수량
            draw.text((col_x_list[3] + 15, r_y + 14), qty_s, fill="#0f172a", font=font_num)
            # 단가
            draw.text((col_x_list[5] - draw.textbbox((0, 0), price_s, font=font_num)[2] - 15, r_y + 14), price_s, fill="#0f172a", font=font_num)
            # 공급가액
            draw.text((col_x_list[6] - draw.textbbox((0, 0), supply_s, font=font_num)[2] - 15, r_y + 14), supply_s, fill="#0f172a", font=font_num)
            # 세액
            draw.text((col_x_list[7] - draw.textbbox((0, 0), tax_s, font=font_num)[2] - 15, r_y + 14), tax_s, fill="#475569", font=font_num)

    # 테이블 하단 합계행
    bot_row_y = table_y + table_h - 55
    draw.line([(pad_x, bot_row_y), (width - pad_x, bot_row_y)], fill="#334155", width=2)
    draw.rectangle([pad_x, bot_row_y, width - pad_x, table_y + table_h], fill="#f8fafc")
    
    draw.text((pad_x + 250, bot_row_y + 16), "소 계 / 합 계", fill="#0f172a", font=font_bold)
    draw.text((col_x_list[3] + 20, bot_row_y + 16), "37 개", fill="#0f172a", font=font_num)
    draw.text((col_x_list[6] - draw.textbbox((0, 0), "1,594,000", font=font_bold)[2] - 15, bot_row_y + 16), "1,594,000", fill="#0f172a", font=font_bold)
    draw.text((col_x_list[7] - draw.textbbox((0, 0), "58,000", font=font_bold)[2] - 15, bot_row_y + 16), "58,000", fill="#0f172a", font=font_bold)

    # 5. 하단 결제 계좌 및 검수 안내
    bot_y = table_y + table_h + 20
    draw.rectangle([pad_x, bot_y, width - pad_x, height - pad_y - 20], fill="#f8fafc", outline="#cbd5e1", width=1)
    
    draw.text((pad_x + 25, bot_y + 20), "입금계좌 : 우리은행  1002-845-667890   예금주 : (주)한결푸드시스템", fill="#1e293b", font=font_bold)
    draw.text((pad_x + 25, bot_y + 50), "안내사항 : 상품 수령 즉시 품목 및 냉장/냉동 신선도 상태를 확인하여 주시기 바랍니다.", fill="#64748b", font=font_small)
    draw.text((pad_x + 25, bot_y + 72), "납품처 : 살롱순라 (종로구 익선/순라길) 정기 새벽 식자재 배송 건", fill="#64748b", font=font_small)

    draw.text((width - pad_x - 220, bot_y + 35), "인수자 :  살 롱 순 라   (서명)", fill="#0f172a", font=font_bold)

    # 저장 경로들
    out_paths = [
        "C:/Users/user/Desktop/살롱순라_거래명세표_샘플.png",
        "C:/Users/user/work/bid_table/public/sample_invoice_salon_sulla.png"
    ]
    
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        img.save(p, "PNG")
        print(f"Saved: {p}")

if __name__ == "__main__":
    create_invoice()
