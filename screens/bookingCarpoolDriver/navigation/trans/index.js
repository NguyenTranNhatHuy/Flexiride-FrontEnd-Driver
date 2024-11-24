const translationGuide = new Map([
  ["arrive_left", "Đích đến bên trái"],
  ["arrive_right", "Đích đến bên phải"],
  ["arrive_straight", "Đích đến phía trước"],
  ["arrive", "Đến"],
  ["close", "Đóng"],
  ["continue_left", "Tiếp tục đi và rẽ trái"],
  ["continue_right", "Tiếp tục đi và rẽ phải"],
  ["continue_slight_left", "Tiếp tục đi và rẽ nhẹ về bên trái"],
  ["continue_slight_right", "Tiếp tục đi và rẽ nhẹ về bên phải"],
  ["continue_straight", "Tiếp tục đi thẳng"],
  ["continue_uturn", "Tiếp tục đi và quay đầu"],
  ["continue", "Tiếp tục đi"],
  ["depart_left", "Rẽ trái khi xuất phát"],
  ["depart_right", "Rẽ phải khi xuất phát"],
  ["depart_straight", "Tiếp tục đi thẳng khi xuất phát"],
  ["depart", "Xuất phát"],
  ["end_of_road_left", "Rẽ trái ở cuối đường"],
  ["end_of_road_right", "Rẽ phải ở cuối đường"],
  ["flag", "Cờ"],
  ["fork_left", "Rẽ trái ở ngã ba"],
  ["fork_right", "Rẽ phải ở ngã ba"],
  ["fork_slight_left", "Rẽ nhẹ về bên trái ở ngã ba"],
  ["fork_slight_right", "Rẽ nhẹ về bên phải ở ngã ba"],
  ["fork_straight", "Tiếp tục đi thẳng ở nơi giao nhánh"],
  ["fork", "Giao nhánh"],
  ["invalid_left", "Hướng trái không hợp lệ"],
  ["invalid_right", "Hướng phải không hợp lệ"],
  ["invalid_slight_left", "Hướng nhẹ về phía trái không hợp lệ"],
  ["invalid_slight_right", "Hướng nhẹ về phía phải không hợp lệ"],
  ["invalid_straight", "Hướng đi thẳng không hợp lệ"],
  ["invalid_uturn", "Hướng quay đầu không hợp lệ"],
  ["invalid", "Hướng không hợp lệ"],
  ["merge_left", "Hợp nhất vào phía trái"],
  ["merge_right", "Hợp nhất vào phía phải"],
  ["merge_slight_left", "Hợp nhất và rẽ nhẹ về phía trái"],
  ["merge_slight_right", "Hợp nhất và rẽ nhẹ về phía phải"],
  ["merge_straight", "Hợp nhất và đi thẳng"],
  ["new_name_left", "Rẽ trái"],
  ["new_name_right", "Rẽ phải"],
  ["new_name_sharp_left", "Rẽ ngoặt về trái"],
  ["new_name_sharp_right", "Rẽ ngoặt về phải"],
  ["new_name_slight_left", "Rẽ nhẹ về trái"],
  ["new_name_slight_right", "Rẽ nhẹ về phải"],
  ["new_name_straight", "Tiếp tục đi thẳng"],
  ["notification_sharp_right", "Rẽ ngoặt về phải"],
  ["notification_left", "Rẽ trái"],
  ["notification_right", "Rẽ phải"],
  ["notification_sharp_left", "Rẽ ngoặt về trái"],
  ["notification_slight_left", "Rẽ nhẹ về trái"],
  ["notification_slight_right", "Rẽ nhẹ về phải"],
  ["notification_straight", "Tiếp tục đi thẳng"],
  ["off_ramp_left", "Rẽ trái ở lối ra"],
  ["off_ramp_right", "Rẽ phải ở lối ra"],
  ["off_ramp_slight_left", "Rẽ nhẹ về trái ở lối ra"],
  ["off_ramp_slight_right", "Rẽ nhẹ về phải ở lối ra"],
  ["on_ramp_left", "Rẽ trái ở lối vào"],
  ["on_ramp_right", "Rẽ phải ở lối vào"],
  ["on_ramp_sharp_left", "Rẽ ngoặt trái ở lối vào"],
  ["on_ramp_sharp_right", "Rẽ ngoặt phải ở lối vào"],
  ["on_ramp_slight_left", "Rẽ nhẹ về trái ở lối vào"],
  ["on_ramp_slight_right", "Rẽ nhẹ về phải ở lối vào"],
  ["on_ramp_straight", "Tiếp tục đi thẳng ở lối vào"],
  ["rotary_left", "Rẽ trái ở vòng xuyến"],
  ["rotary_right", "Rẽ phải ở vòng xuyến"],
  ["rotary_sharp_left", "Rẽ trái ở vòng xuyến"],
  ["rotary_sharp_right", "Rẽ phải ở vòng xuyến"],
  ["rotary_slight_left", "Rẽ nhẹ về trái ở vòng xuyến"],
  ["rotary_slight_right", "Rẽ nhẹ về phải ở vòng xuyến"],
  ["rotary_straight", "Tiếp tục đi thẳng ở vòng xuyến"],
  ["rotary", "Vòng xuyến"],
  ["roundabout_left", "Rẽ trái ở vòng xoay"],
  ["roundabout_right", "Rẽ phải ở vòng xoay"],
  ["roundabout_sharp_left", "Rẽ ngoặt về trái ở vòng xoay"],
  ["roundabout_sharp_right", "Rẽ ngoặt về phải ở vòng xoay"],
  ["roundabout_slight_left", "Rẽ nhẹ về trái ở vòng xoay"],
  ["roundabout_slight_right", "Rẽ nhẹ về phải ở vòng xoay"],
  ["roundabout_straight", "Tiếp tục đi thẳng ở vòng xoay"],
  ["roundabout", "Vòng xoay"],
  ["turn_left", "Rẽ trái"],
  ["turn_right", "Rẽ phải"],
  ["turn_sharp_left", "Rẽ ngoặt về trái"],
  ["turn_sharp_right", "Rẽ ngoặt về phải"],
  ["turn_slight_left", "Rẽ nhẹ về trái"],
  ["turn_slight_right", "Rẽ nhẹ về phải"],
  ["turn_straight", "Tiếp tục đi thẳng"],
  ["updown", ""],
  ["uturn", "Quay đầu"],
]);

export default translationGuide;
