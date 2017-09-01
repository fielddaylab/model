var GamePlayScene = function(game, stage)
{
  var self = this;

  var ALLOW_NEXT = false;
  var ALLOW_SAVE = false;

  var precision = 2;
  var predict = false;

  ENUM = 0;
  var GAME_STATE_MENU = ENUM; ENUM++;
  var GAME_STATE_PLAY = ENUM; ENUM++;
  var game_state;

  var line_color = "#0A182E";
  var graph_bg_color = "#2A3544";
  var graph_fg_color = "#1F2D3F";
  var bg_color = "#485973";

  var green = "#92CF48";
  var red = "#AA0000";
  var white = "#FFFFFF";
  var black = "#000000";
  var brown = "#755232";
  var n_ticks;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var clicker;
  var dragger;
  var hoverer;
  var keyer;
  var blurer;

  var screen_cam;
  var work_cam;

  var modules;
  var selected_module;
  var dragging_obj;
  var full_pause;
  var drag_pause;
  var advance_timer;
  var advance_timer_max;
  var t_max;
  var t_i;

  var add_module_btn;
  var remove_module_btn;
  var next_level_btn;
  var menu_btn
  var print_btn;
  var load_btn;
  var load_template_i;
  var templates;

  var s_dragger;
  var s_graph;
  var s_ctrls;
  var s_editor;

  var blurb;

  var w;
  var h;

  var module_outline_s = 60;
  var module_s = 50;
  var module_fill_s = 45;
  var module_inner_s = 30;

  var good_colors = [];
  good_colors.push("#AFF865");
  good_colors.push("#87E2FF");
  good_colors.push("#F5A623");
  good_colors.push("#FFF46F");
  good_colors.push("#FFAEAE");
  good_colors.push("#E774FF");
  good_colors.push("#ACF9D2");
  good_colors.push("#FF6578");
  good_colors.push("#95F32E");
  good_colors.push("#BDAEFF");

  w = 30;
  h = 30;
  var dongle_img = GenIcon(w,h)
  dongle_img.context.fillStyle = line_color;
  dongle_img.context.lineWidth = 2;
  dongle_img.context.beginPath();
  dongle_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  dongle_img.context.fill();

  w = module_inner_s;
  h = module_inner_s;
  var inner_module_img = GenIcon(w,h)
  inner_module_img.context.fillStyle = white;
  inner_module_img.context.lineWidth = 1;
  inner_module_img.context.beginPath();
  inner_module_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  inner_module_img.context.fill();

  w = module_outline_s;
  h = module_outline_s;
  var selected_module_img = GenIcon(w,h)
  selected_module_img.context.strokeStyle = black;
  selected_module_img.context.lineWidth = 1;
  selected_module_img.context.beginPath();
  selected_module_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  selected_module_img.context.stroke();

  var module_imgs = [];
  var module_img = function(color)
  {
    if(!module_imgs[color])
    {
      w = module_s;
      h = module_s;
      var m_i = GenIcon(w,h)
      m_i.context.fillStyle = color;
      m_i.context.lineWidth = 1;
      m_i.context.beginPath();
      m_i.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
      m_i.context.fill();
      module_imgs[color] = m_i;
    }
    return module_imgs[color];
  }

  w = module_fill_s;
  h = module_fill_s;
  var module_pos_img = GenIcon(w,h)
  module_pos_img.context.fillStyle = green;
  module_pos_img.context.lineWidth = 1;
  module_pos_img.context.beginPath();
  module_pos_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  module_pos_img.context.fill();

  w = module_fill_s;
  h = module_fill_s;
  var module_neg_img = GenIcon(w,h)
  module_neg_img.context.fillStyle = red;
  module_neg_img.context.lineWidth = 1;
  module_neg_img.context.beginPath();
  module_neg_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  module_neg_img.context.fill();

  w = 40;
  h = 40;
  var glob_img = GenIcon(w,h)
  glob_img.context.fillStyle = "#AAAAAA";
  glob_img.context.lineWidth = 1;
  glob_img.context.beginPath();
  glob_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  glob_img.context.fill();

  w = 40;
  h = 40;
  var glob_pos_img = GenIcon(w,h)
  glob_pos_img.context.fillStyle = green;
  glob_pos_img.context.lineWidth = 1;
  glob_pos_img.context.beginPath();
  glob_pos_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  glob_pos_img.context.fill();

  w = 40;
  h = 40;
  var glob_neg_img = GenIcon(w,h)
  glob_neg_img.context.fillStyle = red;
  glob_neg_img.context.lineWidth = 1;
  glob_neg_img.context.beginPath();
  glob_neg_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  glob_neg_img.context.fill();

  var bg_img = new Image();
  bg_img.src = "assets/bg.jpg";
  var add_btn_img = new Image();
  add_btn_img.src = "assets/add_btn.png";
  var remove_btn_img = new Image();
  remove_btn_img.src = "assets/remove_btn.png";
  var menu_btn_img = new Image();
  menu_btn_img.src = "assets/menu_btn.png";
  var gotit_btn_img = new Image();
  gotit_btn_img.src = "assets/gotit_btn.png";
  var next_level_btn_img = new Image();
  next_level_btn_img.src = "assets/next_level_btn.png";
  var reset_btn_img = new Image();
  reset_btn_img.src = "assets/reset_btn.png";
  var next_step_btn_img = new Image();
  next_step_btn_img.src = "assets/next_step_btn.png";
  var speed_slow_btn_img = new Image();
  speed_slow_btn_img.src = "assets/speed_slow_btn.png";
  var speed_slow_btn_down_img = new Image();
  speed_slow_btn_down_img.src = "assets/speed_slow_btn_down.png";
  var speed_med_btn_img = new Image();
  speed_med_btn_img.src = "assets/speed_med_btn.png";
  var speed_med_btn_down_img = new Image();
  speed_med_btn_down_img.src = "assets/speed_med_btn_down.png";
  var speed_fast_btn_img = new Image();
  speed_fast_btn_img.src = "assets/speed_fast_btn.png";
  var speed_fast_btn_down_img = new Image();
  speed_fast_btn_down_img.src = "assets/speed_fast_btn_down.png";
  var wrong_img = new Image();
  wrong_img.src = "assets/wrong.png";
  var right_img = new Image();
  right_img.src = "assets/right.png";
  var close_img = new Image();
  close_img.src = "assets/close.png";
  var girl_img = new Image();
  girl_img.src = "assets/girl.png";

  var level = function()
  {
    var self = this;
    self.title = "";
    self.x = 0;
    self.y = 0;
    self.w = canv.width;
    self.h = canv.height;
    self.primary_module_template = "";
    self.primary_module_target_titles = [];
    self.primary_module_target_vals = [];
    self.ready = noop;
    self.tick = noop;
    self.draw = noop;
    self.add_module_enabled = true;
    self.remove_enabled = true;
    self.save_enabled = false;
    self.load_enabled = false;
    self.play_enabled = true;
    self.speed_enabled = true;
    self.dismissed = 0;
    self.complete = false;
    self.click = function(){ self.dismissed++; };
    self.should_allow_creation = function(type){ return true; }
    self.should_dismiss_blurb = function(){ return true; }
    self.gen_modules = function()
    {
      load_template(self.primary_module_template);
      for(var i = 0; i < modules.length; i++)
      {
        modules[i].primary = true;
        modules[i].primary_index = i;
      }
    }
    self.draw = function() {};
  }

  var levelComplete = function()
  {
    if(ALLOW_NEXT) return true;
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(targets && targets.length)
    {
      for(var i = 0; i < targets[0].length; i++) //inverted loop
        for(var j = 0; j < targets.length; j++)
          if(t_i < i || !modules[j] || modules[j].plot[i] != targets[j][i]) return false
    }
    return true;
  }

  var beginLevel = function()
  {
    selected_module = 0;
    if(blurb.g_viz == 1) blurb.dismiss();
    levels[cur_level_i].gen_modules();
    levels[cur_level_i].ready();
    resetGraph();
    full_pause = true;
  }
  var nextLevel = function()
  {
    if(levels[cur_level_i]) levels[cur_level_i].complete = true;
    cur_level_i++;
    if(cur_level_i >= levels.length) cur_level_i = 0;
    beginLevel();
  }

  var levels = [];
  var level_btns = [];
  var cur_level_i = 0;
  //var cur_level_i = 4-1;
  var l;

  l = new level();
  l.title = "Sandbox";
  l.primary_module_template = "{\"modules\":[]}";
  l.add_module_enabled = true;
  l.remove_enabled = true;
  l.play_enabled = true;
  l.speed_enabled = true;
  l.ready = function()
  {
    blurb.enq(["This is a sandbox- you can create whatever models you want here!","Feel free to play around, or click \"Next Level\" to begin the tutorial!","Once you've figured things out, come back here and build whatever you want!"]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Watch";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Growth Rate (M/T)\",\"type\":1,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    if(t_i < 4)
    {
      if(advance_timer == advance_timer_max && blurb.g_viz != 1)
        blurb.enq(["Click \"Next Step\"!"]);
      if(advance_timer != advance_timer_max && blurb.g_viz == 1)
        blurb.dismiss();
    }
    if(t_i >= 4 && blurb.g_viz != 1)
    {
      blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_ctrls.advance_btn)) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.title = "Rate";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Growth Rate (M/T)\",\"type\":1,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([1,3,5,7,9]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(t_i > 0 && modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["This doesn't conform to our data... Select the Growth Rate module and set its contribution."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(t_i > 0 && modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, modules[1])) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.title = "Start";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Growth Rate (M/T)\",\"type\":1,\"v\":2,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([2,4,6,8,10]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[0] != targets[0][0] && blurb.g_viz != 1)
    {
      blurb.enq(["This doesn't conform to our data... Select the Tree Height module and set its starting value."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[0] == targets[0][0] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, modules[1])) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.title = "Give Life";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true}]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = true;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.should_allow_creation = function(type){ return modules.length < 2; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    if(modules.length == 1 && blurb.g_viz != 1)
    {
      blurb.enq(["Create a module to reproduce our collected data. Click and drag a new module from the + icon."]);
    }
    if(modules.length == 2 && dragging_obj && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
    else if(modules.length == 2 && !dragging_obj && blurb.g_viz == 0)
    {
      blurb.enq(["Hover over your new module, and drag the arrow to the Tree Height Module"]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules.length == 3 && blurb.g_viz == 1)
      blurb.dismiss();
  }
  levels.push(l);

  l = new level();
  l.title = "Build-a-Tree";
  l.primary_module_template = "{\"modules\":[]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([0.5,1,1.5,2,2.5]);
  l.add_module_enabled = true;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.should_allow_creation = function(type)
  {
    var n = 0;
    if(type == MODULE_TYPE_OBJECT)
    {
      for(var i = 0; i < modules.length; i++)
        if(modules[i].type == type) n++;
    }
    if(type == MODULE_TYPE_GENERATOR)
    {
      for(var i = 0; i < modules.length; i++)
        if(modules[i].type == type) n++;
    }
    if(n > 0) return false;
    return true
  }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    if(modules.length == 0 && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Tree Growth Model from scratch!"]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules.length > 0 && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Relationships";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plant Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":0,\"wx\":-0.6,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Grows\",\"type\":2,\"v\":0.5,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":0.1,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.ready = function()
  {
    selected_module = undefined;
    advance_timer_max = 250;
    s_ctrls.speed_slider.val = advance_timer_max;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(t_i > 0 && modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["This doesn't conform to our data... Select the Grows relationship and modify its multiplier."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(t_i > 0 && modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Source";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plant Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Grows\",\"type\":2,\"v\":0.5,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":0.1,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(t_i > 0 && modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["This doesn't conform to our data... Select the Sunlight module and modify its value."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(t_i > 0 && modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Two ways";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plant Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":80,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Grows\",\"type\":2,\"v\":0.5,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":0.1,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([10,20,30,40,50]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[0] != targets[0][0] && blurb.g_viz != 1)
    {
      blurb.enq(["This doesn't conform to our data... Find a way to modify it so that it does! Hint: There's more than one solution!"]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[0] == targets[0][0] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Connect the dots";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plant Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.should_allow_creation = function(type){ return modules.length < 3; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Multiple Sources";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Greenhouse Effect\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":0,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cars\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cows\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":-0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO2 Emissions\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.15,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Methane Release\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.15,\"wy\":-0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,4,7,10,13]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.should_allow_creation = function(type){ return modules.length < 3; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Counteracting Sources";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Greenhouse Effect\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.3,\"wy\":0,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cars\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cows\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.6,\"wy\":-0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Trees\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.8,\"wy\":0,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO2 Emissions\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":0,\"wx\":-0.15,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Methane Release\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.15,\"wy\":-0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO2 Scrubbing\",\"type\":2,\"v\":-1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":0,\"wx\":-0.35,\"wy\":0,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":true,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,4,7,10,13]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.should_allow_creation = function(type){ return modules.length < 3; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Chain Reaction";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plants\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0,\"wy\":-0.125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Bugs\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.5,\"wy\":-0.125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Sunlight\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.5,\"wy\":-0.125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"feed\",\"type\":2,\"v\":0.1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.25,\"wy\":0,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.primary_module_target_titles.push("Bugs");
  l.primary_module_target_vals.push([1,1.1,1.3,1.6,2]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_ctrls.advance_btn)) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.title = "Polynomial Growth";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Minnow Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":-0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Walleye Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"DNR Minnow Dump\",\"type\":1,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":0,\"wx\":-0.7,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Minnow");
  l.primary_module_target_titles.push("Walleye");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.primary_module_target_vals.push([1,2,4,7,11]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.should_allow_creation = function(type){ return modules.length < 4; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Understanding Polynomial Growth";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Minnow Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":-0.3,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Walleye Population\",\"type\":0,\"v\":1,\"min\":0,\"max\":30,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"DNR Minnow Dump\",\"type\":1,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":0,\"wx\":-0.7,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Minnow");
  l.primary_module_target_titles.push("Walleye");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.primary_module_target_vals.push([1,3,7,13,21]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.should_allow_creation = function(type){ return modules.length < 4; }
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
  }
  levels.push(l);

  l = new level();
  l.title = "Big System";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Grass\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.81875,\"wy\":0.078125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Herbivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.21425000000000005,\"wy\":0.08325000000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Carnivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.3224999999999999,\"wy\":0.06737500000000013,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Sun\",\"type\":0,\"v\":10,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.4125,\"wy\":0.1062499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"gives light\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.1204999999999998,\"wy\":0.09262500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"output\":0,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"nourishes\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.492375,\"wy\":0.20825,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"eats\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.52675,\"wy\":-0.06674999999999986,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"dies\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.6540000000000006,\"wy\":0.07125000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"output\":2,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0}]}";
  l.primary_module_target_titles.push("Grass");
  l.primary_module_target_vals.push([1,10.5,19.75,24.13,19.19]);
  l.primary_module_target_titles.push("Herbivores");
  l.primary_module_target_vals.push([1,1.5,11.25,29.88,47.82]);
  l.primary_module_target_titles.push("Carnivores");
  l.primary_module_target_vals.push([1,1.5,2.25,12.38,36.07]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = true;
  l.speed_enabled = true;
  l.ready = function()
  {
    selected_module = undefined;
  }
  l.should_dismiss_blurb = function()
  {
    return false;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[1] != targets[0][1] && blurb.g_viz != 1)
    {
      blurb.enq(["Create the Relationship required to model our collected data."]);
    }
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
    else if(modules[0].plot[1] == targets[0][1] && blurb.g_viz == 1)
    {
      blurb.dismiss();
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_ctrls.advance_btn)) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  var w = 150;
  var h = 70;
  var x = 20;
  var y = 80-h-20;
  var fill_colors = [bg_color,"#4487A3","#92375D","#3D8787","#933D2A","#5F9532"];
  var stroke_colors = ["#FFFFFF","#82D6F4","#E16D9F","#60C5C5","#E96A4E","#A8F665"];
  var color_i = 0;
  var imgs = [];
  for(var i = 0; i < levels.length; i++)
  {
    var btn =
    {
      x:x,
      y:y,
      w:w,
      h:h,
      i:i,
      fill_color:fill_colors[color_i],
      stroke_color:stroke_colors[color_i],
      level:levels[i],
      click:function(evt)
      {
        game_state = GAME_STATE_PLAY;
        cur_level_i = evt.clickable.i;
        beginLevel();
      },
      draw:function(level,self)
      {
        ctx.fillStyle = self.fill_color;
        fillRBox(self,20,ctx);
        ctx.strokeStyle = self.stroke_color;
        strokeRBox(self,20,ctx);
        ctx.fillStyle = white;
        ctx.fillText(level.title.substr(0,18),self.x+10,self.y+25);
        //ctx.strokeRect(self.x,self.y,self.w,self.h);
        //if(level.complete)
          //ctx.strokeRect(self.x+2,self.y+2,self.w-4,self.h-4);
      }
    };
    level_btns.push(btn);

    x += w+20;
    switch(i)
    {
      case 0:
      case 5:
      case 9:
      case 11:
      case 14:
        { x = 20; y += h+40; color_i++; }
        break;
    }
    if(x+w > canv.width) { x = 20; y += h+40; }
  }
  level_btns[0].x = canv.width-w-20;
  level_btns[0].y = canv.height-h-20;

  var blurb_box = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.viz_y = 0;
    self.inviz_y = 0;

    self.viz = 0;
    self.g_viz = 0;

    self.q = [];
    self.q_i = 0;

    var font_size = 20;
    var font = font_size+"px Roboto Mono";
    self.dom = new CanvDom(canv);

    self.enq = function(txt)
    {
      self.q = txt;
      self.q_i = 0;
      self.g_viz = 1;
      self.dom.popDismissableMessage(textToLines(canv, font, self.w-120, self.q[self.q_i]),self.x+20,self.y+15,self.w-80,self.h,function(){});
    }

    self.dismiss = function()
    {
      if(self.q_i < self.q.length-1)
      {
        self.q_i++;
        self.dom.popDismissableMessage(textToLines(canv, font, self.w-120, self.q[self.q_i]),self.x+20,self.y+15,self.w-80,self.h,function(){});
      }
      else
      {
        self.g_viz = 0;
      }
    }

    self.tick = function()
    {
      self.viz = lerp(self.viz,self.g_viz,0.1);
      self.y = lerp(self.inviz_y,self.viz_y,self.viz);
      self.dom.y = self.y+15;
    }

    self.click = function()
    {
      if(levels[cur_level_i] && levels[cur_level_i].should_dismiss_blurb && !levels[cur_level_i].should_dismiss_blurb()) return;
      self.dismiss();
    }

    self.draw = function()
    {
      ctx.strokeStyle = graph_fg_color;
      ctx.fillStyle = graph_bg_color;
      self.h -= 10;
      self.w -= 10;
      fillRBox(self,20,ctx);
      strokeRBox(self,20,ctx);
      self.h += 10;
      self.w += 10;
      ctx.font = font;
      ctx.fillStyle = white;
      self.dom.draw(font_size,canv);
      var w = 100;
      ctx.drawImage(girl_img,self.x+self.w-w-20,self.y+50,w,girl_img.height*(w/girl_img.width));
    }
  }

  var controls = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.pause_btn = new btn();
    self.pause_btn.click = function(evt)
    {
      if(!levels[cur_level_i].play_enabled) return;
      if(!dragging_obj)
      {
        if(!full_pause && t_i >= t_max-1)
          resetGraph();
        else
          full_pause = !full_pause;
      }
    }

    self.advance_btn = new btn();
    self.advance_btn.click = function(evt)
    {
      if(!dragging_obj && advance_timer == advance_timer_max && t_i < t_max-1)
      {
        selected_module = 0;
        advance_timer--;
      }
    }

    self.reset_btn = new btn();
    self.reset_btn.click = function(evt)
    {
      if(!dragging_obj) resetGraph();
    }

    self.speed_slider = new SliderBox(self.x+100,self.y-20,100,15,1,250,advance_timer_max,
      function(v)
      {
        if(!levels[cur_level_i].speed_enabled) return;
        v = round(v);
        var t = advance_timer/advance_timer_max;
        advance_timer_max = v;
        advance_timer = ceil(advance_timer_max * t);
      }
    );

    self.speed_slow_btn = new btn();
    self.speed_slow_btn.click = function(evt)
    {
      if(dragging_obj) return;
      var v = 250;
      var t = advance_timer/advance_timer_max;
      advance_timer_max = v;
      advance_timer = ceil(advance_timer_max * t);
      s_ctrls.speed_slider.val = advance_timer_max;
    }

    self.speed_med_btn = new btn();
    self.speed_med_btn.click = function(evt)
    {
      if(dragging_obj) return;
      var v = 100;
      var t = advance_timer/advance_timer_max;
      advance_timer_max = v;
      advance_timer = ceil(advance_timer_max * t);
      s_ctrls.speed_slider.val = advance_timer_max;
    }

    self.speed_fast_btn = new btn();
    self.speed_fast_btn.click = function(evt)
    {
      if(dragging_obj) return;
      var v = 10;
      var t = advance_timer/advance_timer_max;
      advance_timer_max = v;
      advance_timer = ceil(advance_timer_max * t);
      s_ctrls.speed_slider.val = advance_timer_max;
    }

    self.calc_sub_params = function()
    {
    /*
      self.pause_btn.w = self.h;
      self.pause_btn.h = self.h;
      self.pause_btn.x = self.x + (self.h + 10)*0;
      self.pause_btn.y = self.y - self.h;

      self.speed_slider.x = self.x+100;
      self.speed_slider.y = self.y-20;
      self.speed_slider.w = 100;
      self.speed_slider.h = 15;
      self.speed_slider.calc_slit();
    */

      var prev_btn;

      self.reset_btn.h = self.h;
      self.reset_btn.w = reset_btn_img.width*(self.reset_btn.h/reset_btn_img.height);
      self.reset_btn.x = self.x;
      self.reset_btn.y = self.y;
      prev_btn = self.reset_btn;

      self.advance_btn.h = self.h;
      self.advance_btn.w = next_step_btn_img.width*(self.advance_btn.h/next_step_btn_img.height);
      self.advance_btn.x = prev_btn.x+prev_btn.w+10;
      self.advance_btn.y = self.y;
      prev_btn = self.advance_btn;

      self.speed_slow_btn.h = self.h;
      self.speed_slow_btn.w = speed_slow_btn_img.width*(self.speed_slow_btn.h/speed_slow_btn_img.height);
      self.speed_slow_btn.x = prev_btn.x+prev_btn.w+10;
      self.speed_slow_btn.y = self.y;
      prev_btn = self.speed_slow_btn;

      self.speed_med_btn.h = self.h;
      self.speed_med_btn.w = speed_med_btn_img.width*(self.speed_med_btn.h/speed_med_btn_img.height);
      self.speed_med_btn.x = prev_btn.x+prev_btn.w;
      self.speed_med_btn.y = self.y;
      prev_btn = self.speed_med_btn;

      self.speed_fast_btn.h = self.h;
      self.speed_fast_btn.w = speed_fast_btn_img.width*(self.speed_fast_btn.h/speed_fast_btn_img.height);
      self.speed_fast_btn.x = prev_btn.x+prev_btn.w;
      self.speed_fast_btn.y = self.y;
      prev_btn = self.speed_fast_btn;

      self.w = prev_btn.x+prev_btn.w-self.x;
    }

    self.draw = function()
    {
      ctx.font = "10px Roboto Mono";
      ctx.lineWidth = 1;
      /*
      if(levels[cur_level_i].play_enabled)
      {
        if(full_pause) ctx.fillText("||",self.pause_btn.x+10,self.pause_btn.y+10);
        else           ctx.fillText(">",self.pause_btn.x+10,self.pause_btn.y+10);
        ctx.strokeRect(self.pause_btn.x,self.pause_btn.y,self.pause_btn.w,self.pause_btn.h);
      }
      */
      imageBox(reset_btn_img,self.reset_btn,ctx);
      if(full_pause) imageBox(next_step_btn_img,self.advance_btn,ctx);
      if(advance_timer_max == 250) imageBox(speed_slow_btn_down_img,self.speed_slow_btn,ctx); else imageBox(speed_slow_btn_img,self.speed_slow_btn,ctx);
      if(advance_timer_max == 100) imageBox(speed_med_btn_down_img, self.speed_med_btn,ctx);  else imageBox(speed_med_btn_img, self.speed_med_btn,ctx);
      if(advance_timer_max ==  10) imageBox(speed_fast_btn_down_img,self.speed_fast_btn,ctx); else imageBox(speed_fast_btn_img,self.speed_fast_btn,ctx);
    }
  }

  var graph = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.graph_x = 0;
    self.graph_y = 0;
    self.graph_w = 0;
    self.graph_h = 0;

    self.subgraph_x = 0;
    self.subgraph_y = 0;
    self.subgraph_w = 0;
    self.subgraph_h = 0;

    self.off_x = 0;

    self.calc_sub_params = function()
    {
      self.graph_x = self.x+10;
      self.graph_y = self.y+10;
      //self.graph_w = self.w-20; //needs to be explicitly set!
      self.graph_h = self.h-20;

      self.subgraph_x = self.graph_x+10;
      self.subgraph_y = self.graph_y+10;
      self.subgraph_w = self.graph_w-20; //needs to be explicitly set!
      self.subgraph_h = self.graph_h-20;
    }

    self.draw = function()
    {
      var x = 0;
      var y = 0;

      var graph_i = 0;

      for(var i = 0; i < modules.length; i++)
      {
        if(!modules[i].graph) continue;

        ctx.strokeStyle = graph_fg_color;
        ctx.fillStyle = graph_bg_color;
        fillR(self.graph_x+self.off_x+(graph_i*(self.graph_w+10)),self.graph_y,self.graph_w,self.graph_h,10,ctx);
        ctx.lineWidth = 2;
        strokeR(self.graph_x+self.off_x+(graph_i*(self.graph_w+10)),self.graph_y,self.graph_w,self.graph_h,10,ctx);
        ctx.beginPath();
        for(var j = 0; j < t_max; j++)
        {
          var x = self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+10+ (j/(t_max-1)) * self.subgraph_w;
          ctx.moveTo(x,self.graph_y);
          ctx.lineTo(x,self.graph_y+self.graph_h);
        }
        ctx.stroke();

        ctx.strokeStyle = "#888888";
        x = self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+10+ ((t_i+(1-(advance_timer/advance_timer_max)))/(t_max-1)) * self.subgraph_w;
        ctx.beginPath();
        ctx.moveTo(x,self.graph_y);
        ctx.lineTo(x,self.graph_y+self.graph_h);
        ctx.stroke();

        ctx.strokeStyle = modules[i].color;
        ctx.fillStyle = modules[i].color;

        ctx.font = "20px Roboto Mono";
        ctx.textAlign = "left";
        ctx.fillText(modules[i].title,self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+5,self.graph_y+25)

        ctx.strokeStyle = modules[i].color;
        x = self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+10;
        y = self.subgraph_y+self.subgraph_h;

        ctx.beginPath();
        if(!isNaN(modules[i].plot[0])) y = self.subgraph_y+self.subgraph_h - clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[0]))*self.subgraph_h;
        ctx.moveTo(x,y);
        for(var j = 0; j <= t_i || (predict && j < t_max); j++)
        {
          x = self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+10 + (j/(t_max-1)) * self.subgraph_w;
          if(!isNaN(modules[i].plot[j])) y = self.subgraph_y+self.subgraph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[j]))*self.subgraph_h);
          ctx.lineTo(x,y);
          if(j == t_i)
          {
            if(!isNaN(modules[i].prev_plot)) y = self.subgraph_y+self.subgraph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].prev_plot))*self.subgraph_h);
            ctx.lineTo(x,y);
          }
        }
        ctx.stroke();

        if(levels[cur_level_i] && levels[cur_level_i].primary_module_target_vals[i])
        {
          var targets = levels[cur_level_i].primary_module_target_vals[i];
          for(var j = 0; j < targets.length || !isNaN(modules[i].plot[j]); j++)
          {
            x = self.graph_x+self.off_x+(graph_i*(self.graph_w+10))+10 + (j/(t_max-1)) * self.subgraph_w;
            if(j < targets.length)
            {
              y = self.subgraph_y + self.subgraph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,targets[j]))*self.subgraph_h);
              ctx.beginPath();
              ctx.arc(x,y,4,0,twopi);
              var off = -8;
              if(j <= t_i && !isNaN(modules[i].plot[j]) && modules[i].plot[j] == targets[j])
                ctx.fill();
              else
              {
                ctx.stroke();
                if(j <= t_i && modules[i].plot[j] > targets[j]) off = 14;
              }

              ctx.font = "10px Roboto Mono";
              ctx.textAlign = "center";
              ctx.fillStyle = white;
              ctx.fillText(targets[j],x,y+off);
              ctx.font = "20px Roboto Mono";
              ctx.textAlign = "left";
              ctx.fillStyle = modules[i].color;
            }
            if(j <= t_i && !isNaN(modules[i].plot[j]))
            {
              if((j < targets.length && modules[i].plot[j] != targets[j]) || j >= targets.length)
              {
                ctx.font = "10px Roboto Mono";
                ctx.textAlign = "center";
                ctx.fillStyle = white;
                y = self.subgraph_y + self.subgraph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[j]))*self.subgraph_h);
                var off = 14;
                if(j < targets.length && modules[i].plot[j] > targets[j]) off = -8;
                ctx.fillText(modules[i].plot[j],x,y+off);
                ctx.font = "20px Roboto Mono";
                ctx.textAlign = "left";
                ctx.fillStyle = modules[i].color;
                if(j < targets.length)
                  ctx.drawImage(wrong_img,x-5,y-5,10,10);
              }
            }
          }
        }

        graph_i++;
      }
      ctx.textAlign = "center";
    }
  }

  var module_editor = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.title_box = new TextBox(0,0,0,0,"",18,function(v){ if(selected_module.primary) return; var new_v = v; var old_v = selected_module.title; selected_module.title = new_v; });
    self.v_box     = new NumberBox(0,0,0,0,0,0,function(v)
    {
      if(selected_module.lock_value) return;
      if(selected_module.cache_const)
      {
        if(v < selected_module.min) self.min_box.set(v);
        if(v > selected_module.max) self.max_box.set(v);
      }
      var new_v = fdisp(clamp(selected_module.min,selected_module.max,v),2);
      var old_v = selected_module.v_default;
      selected_module.v_default = new_v;
      if(new_v != old_v) resetGraph();
      if(new_v != v) self.v_box.set(new_v);
    });
    self.min_box   = new NumberBox(0,0,0,0,0,0,function(v){ if(selected_module.lock_min)   return; var new_v = fdisp(min(selected_module.max,v),2);                       var old_v = selected_module.min;       selected_module.min       = new_v; if(new_v != old_v) resetGraph(); if(new_v != v) { self.min_box.set(new_v); self.v_box.set(max(selected_module.v,new_v)); } else { var delta = max((selected_module.max-selected_module.min),1)/100; self.v_box.delta = delta; self.min_box.delta = delta; self.max_box.delta = delta; } });
    self.max_box   = new NumberBox(0,0,0,0,0,0,function(v){ if(selected_module.lock_max)   return; var new_v = fdisp(max(selected_module.min,v),2);                       var old_v = selected_module.max;       selected_module.max       = new_v; if(new_v != old_v) resetGraph(); if(new_v != v) { self.max_box.set(new_v); self.v_box.set(min(selected_module.v,new_v)); } else { var delta = max((selected_module.max-selected_module.min),1)/100; self.v_box.delta = delta; self.min_box.delta = delta; self.max_box.delta = delta; } });
    self.pool_box  = new ToggleBox(0,0,0,0,0,  function(v){ if(selected_module.lock_pool)  return; var new_v = v;                                                         var old_v = selected_module.pool;      selected_module.pool      = new_v; if(new_v != old_v) resetGraph(); });
    self.graph_box = new ToggleBox(0,0,0,0,0,  function(v){ if(selected_module.lock_graph) return; var new_v = v;                                                         var old_v = selected_module.graph;     selected_module.graph     = new_v; });

    self.operator_box_mul = new ToggleBox(0,0,0,0,0,function(v){ var new_v; if(v) new_v = OPERATOR_MUL; else new_v = OPERATOR_DIV; var old_v = selected_module.operator; selected_module.operator = new_v; if(new_v != old_v) resetGraph(); if(self.operator_box_div.on == v) self.operator_box_div.set(!v); });
    self.sign_box_pos     = new ToggleBox(0,0,0,0,0,function(v){ var new_v; if(v) new_v = 1.;           else new_v = -1.;          var old_v = selected_module.sign;     selected_module.sign     = new_v; if(new_v != old_v) resetGraph(); if(self.sign_box_neg.on     == v) self.sign_box_neg.set(!v);     });
    self.operator_box_div = new ToggleBox(0,0,0,0,0,function(v){ if(self.operator_box_div.on == v) self.operator_box_mul.set(!v); });
    self.sign_box_neg     = new ToggleBox(0,0,0,0,0,function(v){ if(self.sign_box_pos.on     == v) self.sign_box_pos.set(!v);     });

    self.calc_sub_params = function()
    {
      if(selected_module)
      {
        var h = 20;
        var w = 20;
        var s = 10;
        var i = 0;

        self.title_box.w = self.w - s*2;
        self.title_box.h = h;
        self.title_box.x = self.x + self.w - self.title_box.w - s;
        self.title_box.y = self.y + s + (h+s)*i;
        i++;

        if(!selected_module.lock_value)
        {
          self.v_box.w = w*2;
          self.v_box.h = h;
          self.v_box.x = self.x + self.w - self.v_box.w - s;
          self.v_box.y = self.y + s + (h+s)*i;
          i++;
        }
        if(!selected_module.cache_const)
        {
          if(!selected_module.lock_min)
          {
            self.min_box.w = w*2;
            self.min_box.h = h;
            self.min_box.x = self.x + self.w - self.min_box.w - s;
            self.min_box.y = self.y + s + (h+s)*i;
            i++;
          }
          if(!selected_module.lock_max)
          {
            self.max_box.w = w*2;
            self.max_box.h = h;
            self.max_box.x = self.x + self.w - self.max_box.w - s;
            self.max_box.y = self.y + s + (h+s)*i;
            i++;
          }
        }
        if(!selected_module.cache_const && !selected_module.lock_pool)
        {
          self.pool_box.w = w;
          self.pool_box.h = h;
          self.pool_box.x = self.x + self.w - self.pool_box.w - s;
          self.pool_box.y = self.y + s + (h+s)*i;
          i++;
        }

        if(!selected_module.lock_graph)
        {
          self.graph_box.w = w;
          self.graph_box.h = h;
          self.graph_box.x = self.x + self.w - self.graph_box.w - s;
          self.graph_box.y = self.y + s + (h+s)*i;
          i++;
        }

        if(selected_module.input_dongle.attachment && !selected_module.cache_const)
        {
          self.operator_box_mul.w = w;
          self.operator_box_mul.h = h;
          self.operator_box_mul.x = self.x + self.w - self.operator_box_mul.w - s;
          self.operator_box_mul.y = self.y + s + (h+s)*i;

          self.operator_box_div.w = w;
          self.operator_box_div.h = h;
          self.operator_box_div.x = self.x + self.w - self.operator_box_div.w - s - (w+s);
          self.operator_box_div.y = self.y + s + (h+s)*i;
          i++;

          self.sign_box_pos.w = w;
          self.sign_box_pos.h = h;
          self.sign_box_pos.x = self.x + self.w - self.sign_box_pos.w - s;
          self.sign_box_pos.y = self.y + s + (h+s)*i;

          self.sign_box_neg.w = w;
          self.sign_box_neg.h = h;
          self.sign_box_neg.x = self.x + self.w - self.sign_box_neg.w - s - (w+s);
          self.sign_box_neg.y = self.y + s + (h+s)*i;
          i++;
        }
      }
      self.h = s+(h+s)*i;
    }

    self.calc_sub_values = function()
    {
      self.title_box.set(selected_module.title);
      self.v_box.set(selected_module.v_default);
      self.min_box.set(selected_module.min);
      self.max_box.set(selected_module.max);
      self.pool_box.set(selected_module.pool);
      self.graph_box.set(selected_module.graph);

      if(selected_module.operator == OPERATOR_MUL) self.operator_box_mul.set(1); else self.operator_box_mul.set(0);
      if(selected_module.sign     == 1)            self.sign_box_pos.set(1); else self.sign_box_pos.set(0);
    }

    self.center = function()
    {
      if(!selected_module) return;
      calc_caches();
      self.x = selected_module.x+selected_module.w/2-self.w/2;
      self.calc_sub_params();
      self.y = selected_module.y-self.h-10;
      //double because 1 calculates h, 2 calculates y
      self.calc_sub_params();
    }

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return doEvtWithinBB(evt, self);
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      drag_pause = true;
      advance_timer = advance_timer_max;
    }
    self.drag = function(evt)
    {
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj = self) dragging_obj = 0;
      drag_pause = false;
    }

    self.filter = function()
    {
      var hit = false;
      if(!selected_module) return false;

      if(dragger.filter(self)) hit = true;

      if(!selected_module.primary)
      {
      if(keyer.filter(self.title_box)) hit = true;
      if(dragger.filter(self.title_box)) hit = true;
      }
      blurer.filter(self.title_box);

      if(keyer.filter(self.v_box)) hit = true;
      if(dragger.filter(self.v_box)) hit = true;
      blurer.filter(self.v_box);

      if(keyer.filter(self.min_box)) hit = true;
      if(dragger.filter(self.min_box)) hit = true;
      blurer.filter(self.min_box);

      if(keyer.filter(self.max_box)) hit = true;
      if(dragger.filter(self.max_box)) hit = true;
      blurer.filter(self.max_box);

      if(clicker.filter(self.pool_box)) hit = true;
      if(clicker.filter(self.graph_box)) hit = true;
      if(clicker.filter(self.operator_box_mul)) hit = true;
      if(clicker.filter(self.operator_box_div)) hit = true;
      if(clicker.filter(self.sign_box_pos)) hit = true;
      if(clicker.filter(self.sign_box_neg)) hit = true;

      return hit;
    }

    self.unfocus = function()
    {
      if(self.title_box.focused) self.title_box.blur();
      if(self.v_box.focused)     self.v_box.blur();
      if(self.min_box.focused)   self.min_box.blur();
      if(self.max_box.focused)   self.max_box.blur();
    }

    self.drawRightAlign = function(obj)
    {
      ctx.textAlign = "right";
      obj.draw(canv);
      ctx.textAlign = "left";
    }
    self.draw = function()
    {
      ctx.font = "10px Roboto Mono";
      ctx.textAlign = "left";
      ctx.fillStyle = white;
      fillRBox(self,10,ctx);
      ctx.fillStyle = black;
      var label_yoff = 15;

      if(selected_module)
      {
        { self.title_box.draw(canv); if(!self.title_box.txt.length) { ctx.fillText("(title)",self.title_box.x+4,self.title_box.y+self.title_box.h*3/4); } }
        if(!selected_module.lock_value)
        {
          self.drawRightAlign(self.v_box);
          ctx.fillStyle = black;
          if(selected_module.output_dongle.attachment && selected_module.input_dongle.attachment)
            ctx.fillText("multiplier",   self.x + 10, self.v_box.y+label_yoff);
          else if(selected_module.output_dongle.attachment)
            ctx.fillText("contribution",   self.x + 10, self.v_box.y+label_yoff);
          else if(!selected_module.output_dongle.attachment)
          {
            if(!selected_module.cache_const)
              ctx.fillText("starting val",   self.x + 10, self.v_box.y+label_yoff);
            else
              ctx.fillText("val",   self.x + 10, self.v_box.y+label_yoff);
          }
        }
        if(!selected_module.cache_const)
        {
          if(!selected_module.lock_min) { self.drawRightAlign(self.min_box); ctx.fillStyle = black; ctx.fillText("min", self.x + 10, self.min_box.y+label_yoff); }
          if(!selected_module.lock_max) { self.drawRightAlign(self.max_box); ctx.fillStyle = black; ctx.fillText("max", self.x + 10, self.max_box.y+label_yoff); }
        }
        if(!selected_module.cache_const && !selected_module.lock_pool) { self.drawRightAlign(self.pool_box);  ctx.fillStyle = black; ctx.fillText("pool",  self.x + 10, self.pool_box.y+label_yoff); }
        if(!selected_module.lock_graph)                                { self.drawRightAlign(self.graph_box); ctx.fillStyle = black; ctx.fillText("graph", self.x + 10, self.graph_box.y+label_yoff); }

        if(selected_module.input_dongle.attachment && !selected_module.cache_const)
        {
          self.drawRightAlign(self.operator_box_mul);
          self.drawRightAlign(self.operator_box_div); ctx.fillStyle = black; ctx.fillText("mul/div",  self.x + 10, self.operator_box_div.y+label_yoff);
          self.drawRightAlign(self.sign_box_pos);
          self.drawRightAlign(self.sign_box_neg);     ctx.fillStyle = black; ctx.fillText("pos/nev",  self.x + 10, self.sign_box_neg.y+label_yoff);
        }
      }
    }
  }

  var screen_dragger = function()
  {
    var self = this;
    self.last_x = 0
    self.last_y = 0
    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      selected_module = 0;
      return true;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      self.last_x = evt.doX;
      self.last_y = evt.doY;
    }
    self.drag = function(evt)
    {
      work_cam.wx += (self.last_x-evt.doX)/500;
      work_cam.wy -= (self.last_y-evt.doY)/500;
      self.last_x = evt.doX;
      self.last_y = evt.doY;
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj = self) dragging_obj = 0;
    }
  }

  var print_template = function()
  {
    var str = "";
    str += "{\"modules\":[";
    for(var i = 0; i < modules.length; i++)
    {
      var m = modules[i];
      var input = -1;
      var output = -1;
      if(m.input_dongle.attachment)
      {
        for(var j = 0; j < modules.length; j++)
          if(m.input_dongle.attachment == modules[j]) input = j;
      }
      if(m.output_dongle.attachment)
      {
        for(var j = 0; j < modules.length; j++)
          if(m.output_dongle.attachment == modules[j]) output = j;
      }
      console.log(m);
      str += "{\"title\":\""+m.title+"\",\"type\":"+m.type+",\"v\":"+m.v_default+",\"min\":"+m.min+",\"max\":"+m.max+",\"pool\":"+m.pool+",\"graph\":"+m.graph+",\"wx\":"+m.wx+",\"wy\":"+m.wy+",\"ww\":"+m.ww+",\"wh\":"+m.wh+",\"input\":"+input+",\"output\":"+output+",\"lock_move\":"+m.lock_move+",\"lock_input\":"+m.lock_input+",\"lock_output\":"+m.lock_output+",\"lock_value\":"+m.lock_value+",\"lock_min\":"+m.lock_min+",\"lock_max\":"+m.lock_max+",\"lock_pool\":"+m.lock_pool+",\"lock_graph\":"+m.lock_graph+"}";
      if(i < modules.length-1) str += ",";
    }
    str += "]}";

    templates.push(str);
    console.log(str);
    console.log("for copy paste into source:")
    console.log("\""+str.replace(/\"/g,"\\\"")+"\"");
  }

  var load_template = function(template)
  {
    var t = JSON.parse(template);
    modules = [];

    for(var i = 0; i < t.modules.length; i++)
    {
      var tm = t.modules[i];
      var m = new module(tm.wx,tm.wy,tm.ww,tm.wh);
      screenSpace(work_cam,canv,m);
      m.title = tm.title;
      m.type = tm.type;
      m.v_default = tm.v;
      m.v = m.v_default;
      m.min = tm.min;
      m.max = tm.max;
      m.pool = tm.pool;
      m.graph = tm.graph;
      m.lock_move = tm.lock_move;
      m.lock_input = tm.lock_input;
      m.lock_output = tm.lock_output;
      m.lock_value = tm.lock_value;
      m.lock_min = tm.lock_min;
      m.lock_max = tm.lock_max;
      m.lock_pool = tm.lock_pool;
      m.lock_graph = tm.lock_graph;
      m.plot[0] = m.v;
      m.prev_plot = m.v;
      modules.push(m);
    }
    for(var i = 0; i < t.modules.length; i++)
    {
      var tm = t.modules[i];
      if(tm.input >= 0)
        modules[i].input_dongle.attachment = modules[tm.input];
      if(tm.output >= 0)
        modules[i].output_dongle.attachment = modules[tm.output];
    }

    work_cam.wx = 0;
    work_cam.wy = 0;
  }

  var load_next_template = function()
  {
    load_template_i++;
    if(load_template_i > templates.length-1)
      load_template_i = 0;
    load_template(templates[load_template_i]);
  }

  var btn = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
  }

  var dongle = function(offx,offy,r,src)
  {
    var self = this;
    self.src = src;
    self.off = {x:offx,y:offy};
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self || evt.hitUI) return false;
      return distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.w/2+self.off.y,evt.doX,evt.doY) < self.r*self.r;
    }
    self.dragStart = function(evt)
    {
      evt.hitUI = true;
      dragging_obj = self;
      drag_pause = true;
      advance_timer = advance_timer_max;
      self.drag_start_x = evt.doX;
      self.drag_start_y = evt.doY;
    }
    self.drag = function(evt)
    {
      //?
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self) dragging_obj = 0;
      drag_pause = false;
    }
  }
  var toggle_dongle = function(offx,offy,r,src)
  {
    var self = this;
    self.src = src;
    self.off = {x:offx,y:offy};
    self.drag_x = 0;
    self.drag_y = 0;
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;

    self.shouldDrag = function(evt)
    {
      if(dragging_obj || evt.hitUI) return false;
      if(distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.w/2+self.off.y,evt.doX,evt.doY) < self.r*self.r)
      {
        evt.hitUI = true;
        return true;
      }
      return false;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      self.dragging = false;
    }
  }
  var whippet_dongle = function(offx,offy,r,src,srcShouldDrag)
  {
    var self = this;
    self.src = src;
    self.srcShouldDrag = srcShouldDrag;
    self.off = {x:offx,y:offy};
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;
    self.attachment = 0;

    self.shouldDrag = function(evt)
    {
      if((dragging_obj && dragging_obj != self) || !self.srcShouldDrag()) return false;
      if(distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.h/2+self.off.y,evt.doX,evt.doY) < self.r*self.r)
      {
        if(src.type == MODULE_TYPE_MODULE || src.type == MODULE_TYPE_OBJECT) src.swapIntoRelationship();
        return true;
      }
      return false;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      drag_pause = true;
      advance_timer = advance_timer_max;
      self.drag_start_x = evt.doX;
      self.drag_start_y = evt.doY;
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
      if(self.attachment)
      {
        self.attachment = 0;
        resetGraph();
      }
      self.src.whippet_dragged(self);
      s_editor.center();
    }
    self.drag = function(evt)
    {
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
      self.src.whippet_dragged(self);
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self) dragging_obj = 0;
      drag_pause = false;
      self.attachment = 0;
      for(var i = 0; i < modules.length; i++)
      {
        if(self.src != modules[i] && doEvtWithinBB(evt, modules[i]))
          self.attachment = modules[i];
      }
      if(!self.attachment)
        deleteModule(self.src);
      resetGraph();
      s_editor.center();
    }
  }

  ENUM = 0;
  var OPERATOR_MUL = ENUM; ENUM++;
  var OPERATOR_DIV = ENUM; ENUM++;
  ENUM = 0;
  var MODULE_TYPE_OBJECT       = ENUM; ENUM++;
  var MODULE_TYPE_GENERATOR    = ENUM; ENUM++;
  var MODULE_TYPE_RELATIONSHIP = ENUM; ENUM++;
  var MODULE_TYPE_MODULE       = ENUM; ENUM++;
  var module = function(wx,wy,ww,wh)
  {
    var self = this;
    refreshModule(self);
    self.cache_const = true;
    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;
    screenSpace(work_cam,canv,self);

    self.shouldShowInputDongle = function()
    {
      var should =
      (
        (
          self.type == MODULE_TYPE_MODULE &&
          (
            self.input_dongle.attachment ||
            self.input_dongle.dragging ||
            (
              self.output_dongle.attachment &&
              self.hovering &&
              !dragging_obj
            )
          )
        )
        ||
        (
          self.type == MODULE_TYPE_RELATIONSHIP
        )
      );
      return should;
    }
    self.shouldShowOutputDongle = function()
    {
      var should =
      (
        (
          self.type == MODULE_TYPE_MODULE &&
          (
            self.output_dongle.attachment ||
            self.output_dongle.dragging ||
            (
              self.hovering &&
              !dragging_obj
            )
          )
        )
        ||
        (
          self.type == MODULE_TYPE_RELATIONSHIP
        )
        ||
        (
          self.type == MODULE_TYPE_GENERATOR
        )
      );
      return should;
    }
    self.whippet_dragged = function(whippet)
    {
      if(whippet == self.output_dongle)
      {
        if(self.input_dongle.attachment)
        {
          self.x = lerp(self.output_dongle.drag_x,self.input_dongle.attachment.x+self.input_dongle.attachment.w/2,0.5)-self.w/2;
          self.y = lerp(self.output_dongle.drag_y,self.input_dongle.attachment.y+self.input_dongle.attachment.h/2,0.5)-self.h/2;
          worldSpaceCoords(work_cam,canv,self);
        }
      }
      if(whippet == self.input_dongle)
      {
        if(self.output_dongle.attachment)
        {
          self.x = lerp(self.input_dongle.drag_x,self.output_dongle.attachment.x+self.output_dongle.attachment.w/2,0.5)-self.w/2;
          self.y = lerp(self.input_dongle.drag_y,self.output_dongle.attachment.y+self.output_dongle.attachment.h/2,0.5)-self.h/2;
          worldSpaceCoords(work_cam,canv,self);
        }
      }
    }

    self.input_dongle = new whippet_dongle( self.w,0,dongle_img.width/4,self,self.shouldShowInputDongle);
    self.output_dongle = new whippet_dongle(-self.w,0,dongle_img.width/4,self,self.shouldShowOutputDongle);

    //the module itself
    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return doEvtWithinBB(evt,self);
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      selected_module = self;
      self.drag_start_x = evt.doX-self.x;
      self.drag_start_y = evt.doY-self.y;
      s_editor.center();
      s_editor.calc_sub_values();
    }
    self.drag = function(evt)
    {
      self.x = evt.doX-self.drag_start_x;
      self.y = evt.doY-self.drag_start_y;
      worldSpaceCoords(work_cam,canv,self);
      s_editor.center();
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self)
      {
        dragging_obj = 0;
        if(!self.primary && rectCollide(self.x,self.y,self.w,self.h,remove_module_btn.x,remove_module_btn.y,remove_module_btn.w,remove_module_btn.h))
          deleteModule(self);
        if(self.title == "") s_editor.title_box.focus();
      }
    }

    self.swapIntoRelationship = function()
    {
      if(self.type != MODULE_TYPE_MODULE) return;
      var clone = new module(self.wx, self.wy, self.ww, self.wh);
      cloneModule(self,clone);
      refreshModule(self);
      self.wx = clone.wx;
      self.wy = clone.wy;
      self.ww = clone.ww;
      self.wh = clone.wh;
      screenSpace(work_cam,canv,self);
      clone.input_dongle = new whippet_dongle( clone.w,0,dongle_img.width/4,clone,clone.shouldShowInputDongle);
      clone.output_dongle = new whippet_dongle(-clone.w,0,dongle_img.width/4,clone,clone.shouldShowOutputDongle);
      self.type = MODULE_TYPE_RELATIONSHIP;
      self.graph = false;

      self.input_dongle.attachment = clone;

      for(var i = 0; i < modules.length; i++)
      {
        if(modules[i] == self) modules[i] = clone;
        if(modules[i].input_dongle.attachment == self) modules[i].input_dongle.attachment = clone;
        if(modules[i].output_dongle.attachment == self) modules[i].output_dongle.attachment = clone;
      }
      modules.push(self);
      if(selected_module == self) selected_module = clone;
    }

    self.hover   = function(){}
    self.unhover = function(){}

    var glob_0 = {x:0,y:0};
    var d_01 = 0;
    var glob_1 = {x:0,y:0};
    var d_12 = 0;
    var glob_2 = {x:0,y:0};
    var d_23 = 0;
    var glob_3 = {x:0,y:0};
    var d_t = 0;
    var d_cur = 0;
    var t_t = 0;

    self.drawLines = function()
    {
      ctx.lineWidth = 2;
      ctx.strokeStyle = line_color;

      //away from dongles
      //input_dongle_line
      if(self.input_dongle.dragging)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
        ctx.lineTo(self.input_dongle.drag_x,self.input_dongle.drag_y);
        ctx.stroke();
      }
      else if(self.input_dongle.attachment)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
        ctx.lineTo(self.input_dongle.attachment.x+self.input_dongle.attachment.w/2,self.input_dongle.attachment.y+self.input_dongle.attachment.h/2);
        ctx.stroke();
      }

      //output_dongle_line
      if(self.output_dongle.dragging)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.output_dongle.off.x,self.y+self.h/2+self.output_dongle.off.y);
        ctx.lineTo(self.output_dongle.drag_x,self.output_dongle.drag_y);
        ctx.stroke();
      }
      else if(self.output_dongle.attachment)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.output_dongle.off.x,self.y+self.h/2+self.output_dongle.off.y);
        ctx.lineTo(self.output_dongle.attachment.x+self.output_dongle.attachment.w/2,self.output_dongle.attachment.y+self.output_dongle.attachment.h/2);
        ctx.stroke();
      }

      //to dongle
      //input_dongle
      if(self.shouldShowInputDongle())
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2,                        self.y+self.h/2);
        ctx.lineTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
        ctx.stroke();
      }

      //output_dongle
      if(self.shouldShowOutputDongle())
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2,                         self.y+self.h/2);
        ctx.lineTo(self.x+self.w/2+self.output_dongle.off.x,self.y+self.h/2+self.output_dongle.off.y);
        ctx.stroke();
      }
    }
    self.drawBody = function()
    {
      //new
      if(self.type == MODULE_TYPE_MODULE || self.type == MODULE_TYPE_OBJECT)
      {
        if(self.cache_const)
        {
          if(!self.body_cache.module_const)
          {
            self.body_cache.module_const = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
            self.body_cache.module_const.context.fillStyle = bg_color;
            self.body_cache.module_const.context.strokeStyle = self.color;
            fillR(self.body_cache.buffer,self.body_cache.buffer,self.w,self.h,10,self.body_cache.module_const.context);
            strokeR(self.body_cache.buffer,self.body_cache.buffer,self.w,self.h,10,self.body_cache.module_const.context);
          }
          ctx.drawImage(self.body_cache.module_const,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
        }
        else
        {
          if(self.pool)
          {
            if(!self.body_cache.module_nconst_pool)
            {
              self.body_cache.module_nconst_pool = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
              self.body_cache.module_nconst_pool.context.fillStyle = bg_color;
              self.body_cache.module_nconst_pool.context.strokeStyle = self.color;
              self.body_cache.module_nconst_pool.context.beginPath();
              self.body_cache.module_nconst_pool.context.arc(self.body_cache.buffer+self.w/2,self.body_cache.buffer+self.h/2,self.w/2,0,twopi);
              self.body_cache.module_nconst_pool.context.fill();
              self.body_cache.module_nconst_pool.context.stroke();
              self.body_cache.module_nconst_pool.context.globalAlpha = 0.2;
              self.body_cache.module_nconst_pool.context.fillStyle = self.color;
              self.body_cache.module_nconst_pool.context.fill();
              self.body_cache.module_nconst_pool.context.globalAlpha = 1;
            }
            ctx.drawImage(self.body_cache.module_nconst_pool,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);

            //body
            var s = module_s;
            if((self.input_dongle.attachment && self.output_dongle.attachment) || self.type == MODULE_TYPE_RELATIONSHIP)
              s *= 0.75;
            //ctx.drawImage(module_img(self.color),self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
            var p  = 1;
            var zp = 0;
            if(self.min != self.max)
            {
              p  = clamp(0,1,mapVal(self.min,self.max,0,1,self.v_lag));
              zp = mapVal(self.min,self.max,0,1,clamp(self.min,self.max,0));
            }

            var ymin;
            var ymax;
            var img = 0;
            if(p > zp)
            {
              var s = module_fill_s-5;
              ymin = self.y+self.h/2-s/2+(s*(1-p));
              ymax = self.y+self.h/2-s/2+(s*(1-zp));
              img = module_img(self.color);
            }
            else if(zp > p)
            {
              var s = module_fill_s-5;
              ymin = self.y+self.h/2-s/2+(s*(1-zp));
              ymax = self.y+self.h/2-s/2+(s*(1-p));
              img = module_neg_img;
            }

            if(img)
            {
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(self.x,       ymin);
              ctx.lineTo(self.x+self.w,ymin);
              ctx.lineTo(self.x+self.w,ymax);
              ctx.lineTo(self.x,       ymax);
              ctx.closePath();
              ctx.clip();
              var s = module_fill_s;
              ctx.drawImage(img,self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
              ctx.restore();
            }
          }
          else
          {
            if(!self.body_cache.module_nconst_npool)
            {
              self.body_cache.module_nconst_npool = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
              self.body_cache.module_nconst_npool.context.fillStyle = bg_color;
              self.body_cache.module_nconst_npool.context.strokeStyle = self.color;
              self.body_cache.module_nconst_npool.context.beginPath();
              self.body_cache.module_nconst_npool.context.arc(self.body_cache.buffer+self.w/2,self.body_cache.buffer+self.h/2,self.w/2,0,twopi);
              self.body_cache.module_nconst_npool.context.fill();
              self.body_cache.module_nconst_npool.context.stroke();
            }
            ctx.drawImage(self.body_cache.module_nconst_npool,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
          }
        }
      }
      else
      {
        if(self.cache_const)
        {
          if(self.v != 1)
          {
            if(!self.body_cache.rel_const)
            {
              self.body_cache.rel_const = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
              self.body_cache.rel_const.context.fillStyle = bg_color;
              fillR(self.body_cache.buffer+self.w/4,self.body_cache.buffer+self.h/3,self.w/2,self.h/3,5,self.body_cache.rel_const.context);
              self.body_cache.rel_const.context.strokeStyle = line_color;
              strokeR(self.body_cache.buffer+self.w/4,self.body_cache.buffer+self.h/3,self.w/2,self.h/3,5,self.body_cache.rel_const.context);
            }
            ctx.drawImage(self.body_cache.rel_const,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
          }
        }
        else
        {
          if(!self.body_cache.rel_nconst)
          {
            self.body_cache.rel_nconst = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
            self.body_cache.rel_nconst.context.fillStyle = bg_color;
            self.body_cache.rel_nconst.context.strokeStyle = line_color;
            self.body_cache.rel_nconst.context.beginPath();
            self.body_cache.rel_nconst.context.arc(self.body_cache.buffer+self.w/2,self.body_cache.buffer+self.h/2,self.w/4,0,twopi);
            self.body_cache.rel_nconst.context.fill();
            self.body_cache.rel_nconst.context.stroke();
          }
          ctx.drawImage(self.body_cache.rel_nconst,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
        }
      }

      /*
      //old
      if(selected_module == self)
      {
        var s = module_outline_s;
        ctx.drawImage(selected_module_img,self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
      }

      if(self.cache_const) return;


      */
    }
    self.drawDongles = function()
    {
      //input_dongle
      if(self.shouldShowInputDongle())
      {
        base.x = self.x+self.w/2+self.input_dongle.off.x;
        base.y = self.y+self.h/2+self.input_dongle.off.y;
        from.x = self.input_dongle.off.x;
        from.y = self.input_dongle.off.y;
        safenormvec(from,1,from);
        from.x = -from.x;
        from.y = -from.y;
        target.x = -from.y;
        target.y = from.x;
        ctx.drawImage(dongle_img,base.x-self.input_dongle.r,base.y-self.input_dongle.r,self.input_dongle.r*2,self.input_dongle.r*2);
        base.x -= from.x*2;
        base.y -= from.y*2;
        ctx.strokeStyle = white;
        ctx.beginPath();
        ctx.moveTo(base.x+target.x*4,base.y+target.y*4);
        ctx.lineTo(base.x+  from.x*4,base.y+  from.y*4);
        ctx.lineTo(base.x-target.x*4,base.y-target.y*4);
        ctx.stroke();
      }
      //output_dongle
      if(self.shouldShowOutputDongle())
      {
        //ctx.drawImage(dongle_img,self.x+self.w/2+self.output_dongle.off.x-self.output_dongle.r,self.y+self.h/2+self.output_dongle.off.y-self.output_dongle.r,self.output_dongle.r*2,self.output_dongle.r*2);
        base.x = self.x+self.w/2+self.output_dongle.off.x;
        base.y = self.y+self.h/2+self.output_dongle.off.y;
        from.x = self.output_dongle.off.x;
        from.y = self.output_dongle.off.y;
        safenormvec(from,1,from);
        target.x = -from.y;
        target.y = from.x;
        ctx.drawImage(dongle_img,base.x-self.output_dongle.r,base.y-self.output_dongle.r,self.output_dongle.r*2,self.output_dongle.r*2);
        base.x -= from.x*2;
        base.y -= from.y*2;
        ctx.strokeStyle = white;
        ctx.beginPath();
        ctx.moveTo(base.x+target.x*4,base.y+target.y*4);
        ctx.lineTo(base.x+  from.x*4,base.y+  from.y*4);
        ctx.lineTo(base.x-target.x*4,base.y-target.y*4);
        ctx.stroke();
      }
    }
    self.drawBlob = function()
    {
      ctx.font = "10px Roboto Mono";
      t_t = 1-(advance_timer/advance_timer_max);
      if(t_t > 0.1 && self.output_dongle.attachment)
      {
        if(!self.input_dongle.attachment)
        {
          glob_0.x = self.x+self.w/2;
          glob_0.y = self.y+self.h/2;
          glob_1.x = self.x+self.w/2;
          glob_1.y = self.y+self.h/2;

          glob_2.x = self.x+self.w/2+self.output_dongle.off.x;
          glob_2.y = self.y+self.h/2+self.output_dongle.off.y;
          glob_3.x = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
          glob_3.y = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
        }
        else
        {
          if(t_t < 0.5)
          {
            t_t *= 2;
            glob_0.x = self.input_dongle.attachment.x+self.input_dongle.attachment.w/2;
            glob_0.y = self.input_dongle.attachment.y+self.input_dongle.attachment.h/2;
            glob_1.x = self.x+self.w/2+self.input_dongle.off.x;
            glob_1.y = self.y+self.h/2+self.input_dongle.off.y;

            glob_2.x = self.x+self.w/2;
            glob_2.y = self.y+self.h/2;
            glob_3.x = self.x+self.w/2;
            glob_3.y = self.y+self.h/2;
          }
          else
          {
            t_t = (t_t-0.5)*2;

            glob_0.x = self.x+self.w/2;
            glob_0.y = self.y+self.h/2;
            glob_1.x = self.x+self.w/2;
            glob_1.y = self.y+self.h/2;

            glob_2.x = self.x+self.w/2+self.output_dongle.off.x;
            glob_2.y = self.y+self.h/2+self.output_dongle.off.y;
            glob_3.x = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
            glob_3.y = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
          }
        }

        d_01 = tldist(glob_0,glob_1);
        d_12 = tldist(glob_1,glob_2);
        d_23 = tldist(glob_2,glob_3);
        d_t = d_01+d_12+d_23;
        d_cur = 0;
        if(t_t < 0.1) t_t = 0;
        else t_t = (t_t-0.1)/(1.-0.1);
        d_cur = d_t*t_t;
        var t;
        var src;
        var dst;
        if(d_cur < d_01)
        {
          t = d_cur/d_01;
          src = glob_0;
          dst = glob_1;
        }
        else if(d_cur < d_01+d_12)
        {
          t = (d_cur-d_01)/d_12;
          src = glob_1;
          dst = glob_2;
        }
        else if(d_cur < d_01+d_12+d_23)
        {
          t = (d_cur-d_01-d_12)/d_23;
          src = glob_2;
          dst = glob_3;
        }
        else
        {
          t = 1;
          src = glob_2;
          dst = glob_2;
        }

        var x = lerp(src.x,dst.x,t);
        var y = lerp(src.y,dst.y,t);
        var s = self.blob_s;
        var ts = 20;
        var txt;
        if(self.input_dongle.attachment)
        {
          t_t = 1-(advance_timer/advance_timer_max);
          if(t_t < 0.5)
          {
            if(self.input_dongle.attachment.v > 0 && self.output_dongle.attachment && self.output_dongle.attachment.pool)
              txt = "+"+fdisp(self.input_dongle.attachment.v,2);
            else
              txt = fdisp(self.input_dongle.attachment.v,2);
          }
          else
          {
            if(self.input_dongle.attachment.v*self.v > 0 && self.output_dongle.attachment && self.output_dongle.attachment.pool)
              txt = "+"+fdisp(self.input_dongle.attachment.v*self.v,2);
            else
              txt = fdisp(self.input_dongle.attachment.v*self.v,2);
          }
        }
        else
        {
          if(self.v > 0 && self.output_dongle.attachment && self.output_dongle.attachment.pool)
            txt = "+"+fdisp(self.v,2);
          else
            txt = fdisp(self.v,2);
        }

        ctx.textAlign = "center";
        if(txt < 0)
        {
          ctx.fillStyle = black;
          ctx.drawImage(glob_neg_img,x-s*ts/2,y-s*ts/2,s*ts,s*ts);
        }
        else if(txt > 0)
        {
          ctx.fillStyle = black;
          ctx.drawImage(glob_pos_img,x-s*ts/2,y-s*ts/2,s*ts,s*ts);
        }
        else
        {
          ctx.fillStyle = black;
          ctx.drawImage(glob_img,x-s*ts/2,y-s*ts/2,s*ts,s*ts);
        }
        ctx.fillText(txt,x,y+3);
      }
    }
    self.drawValue = function()
    {
      //new
      ctx.fillStyle = white
      ctx.font = "10px Roboto Mono";
      if(self.type == MODULE_TYPE_MODULE || self.type == MODULE_TYPE_OBJECT)
      {
        ctx.fillText(self.title,self.x+self.w/2,self.y-10);
        ctx.font = "30px Roboto Mono";
        ctx.fillText(fdisp(self.v,2),self.x+self.w/2,self.y+self.h/2+10);
      }
      else
      {
        ctx.fillText(self.title,self.x+self.w/2,self.y+10);
        if(self.v != 1 || !self.cache_const)
        {
          ctx.font = "10px Roboto Mono";
          ctx.fillText("x"+fdisp(self.v,2),self.x+self.w/2,self.y+self.h/2+5);
        }
      }

      /*
      //old
      var s = module_inner_s*self.val_s;
      if((self.input_dongle.attachment && self.output_dongle.attachment) || self.type == MODULE_TYPE_RELATIONSHIP)
        s *= 0.75;
      ctx.drawImage(inner_module_img,self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
      var targets = levels[cur_level_i].primary_module_target_vals;
      ctx.fillStyle = black
      ctx.fillText(self.title,self.x+self.w/2,self.y-10);
      if(self.primary && targets[self.primary_index])
      {
        if(targets[self.primary_index].length <= t_i)
          ctx.fillStyle = black;
        else if(targets[self.primary_index][t_i] == self.v)
          ctx.fillStyle = green;
        else
          ctx.fillStyle = red;
      }
      if((self.input_dongle.attachment && self.output_dongle.attachment) || self.type == MODULE_TYPE_RELATIONSHIP)
        ctx.fillText("x"+fdisp(self.v,2),self.x+self.w/2,self.y+self.h/2+5);
      else
        ctx.fillText(fdisp(self.v,2),self.x+self.w/2,self.y+self.h/2+5);

      var t = 1-(advance_timer/advance_timer_max);
      if(self.cache_delta > 0)
      {
        var olda = ctx.globalAlpha;
        ctx.globalAlpha = (1-t);
        ctx.fillStyle = green;
        ctx.fillText("+"+self.cache_delta,self.x+sin(t*5*pi),self.y-t*20);
        ctx.globalAlpha = olda;
      }
      else if(self.cache_delta < 0)
      {
        var olda = ctx.globalAlpha;
        ctx.globalAlpha = (1-t);
        ctx.fillStyle = red;
        ctx.fillText(self.cache_delta,self.x+sin(t*5*pi),self.y-t*20);
        ctx.globalAlpha = olda;
      }
      */
    }

    var base = {x:0,y:0};
    var from = {x:0,y:0};
    var target = {x:0,y:0};
    var vel = {x:0,y:0};
    var ave = {x:0,y:0};
    self.tick = function()
    {
      var len;
      var dongle_r = 20;

      normvec(self.input_dongle.off,self.input_dongle.off);
      normvec(self.output_dongle.off,self.output_dongle.off);
      if(self.input_dongle.attachment || self.input_dongle.dragging)
      {
        if(self.input_dongle.attachment)
        {
          target.x = self.input_dongle.attachment.x+self.input_dongle.attachment.w/2;
          target.y = self.input_dongle.attachment.y+self.input_dongle.attachment.h/2;
        }
        else if(self.input_dongle.dragging)
        {
          target.x = self.input_dongle.drag_x;
          target.y = self.input_dongle.drag_y;
        }
        from.x = self.x+self.w/2+self.input_dongle.off.x;
        from.y = self.y+self.h/2+self.input_dongle.off.y;
        subvec(target,from,vel);
        safenormvec(vel,1,vel);
        mulvec(vel,0.5,vel);
        addvec(self.input_dongle_vel,vel,self.input_dongle_vel);
      }
      if(self.output_dongle.attachment || self.output_dongle.dragging)
      {
        if(self.output_dongle.attachment)
        {
          target.x = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
          target.y = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
        }
        else if(self.output_dongle.dragging)
        {
          target.x = self.output_dongle.drag_x;
          target.y = self.output_dongle.drag_y;
        }
        from.x = self.x+self.w/2+self.output_dongle.off.x;
        from.y = self.y+self.h/2+self.output_dongle.off.y;
        subvec(target,from,vel);
        safenormvec(vel,-1,vel);
        mulvec(vel,0.5,vel);
        addvec(self.output_dongle_vel,vel,self.output_dongle_vel);
      }
      addvec(self.input_dongle.off,self.input_dongle_vel,self.input_dongle.off);
      addvec(self.output_dongle.off,self.output_dongle_vel,self.output_dongle.off);
      normvec(self.input_dongle.off,self.input_dongle.off);
      normvec(self.output_dongle.off,self.output_dongle.off);

      avevec(self.input_dongle.off,self.output_dongle.off,ave);

      subvec(self.input_dongle.off,ave,self.input_dongle.off);
      subvec(self.output_dongle.off,ave,self.output_dongle.off);

      safenormvec(self.input_dongle.off, -1,self.input_dongle.off);
      safenormvec(self.output_dongle.off, 1,self.output_dongle.off);

      mulvec(self.input_dongle.off,dongle_r,self.input_dongle.off);
      mulvec(self.output_dongle.off,dongle_r,self.output_dongle.off);

      mulvec(self.input_dongle_vel,0.9,self.input_dongle_vel);
      mulvec(self.output_dongle_vel,0.9,self.output_dongle_vel);

      if(
        (
          self.type == MODULE_TYPE_MODULE &&
          !self.output_dongle.attachment &&
          !self.output_dongle.dragging &&
          self.hovering &&
          !dragging_obj
        )
        ||
        (
          self.type == MODULE_TYPE_RELATIONSHIP &&
          !self.output_dongle.attachment &&
          !self.output_dongle.dragging
        )
        ||
        (
          self.type == MODULE_TYPE_GENERATOR &&
          !self.output_dongle.attachment &&
          !self.output_dongle.dragging
        )
      )
      {
        if(self.input_dongle.attachment || self.input_dongle.dragging)
        {
          safenormvec(self.output_dongle.off,1,self.output_dongle.off);
          mulvec(self.output_dongle.off,20,self.output_dongle.off);
        }
        else
        {
          self.output_dongle.off.x = 20;
          self.output_dongle.off.y = 0;
        }
      }

      if(
        (
          self.type == MODULE_TYPE_MODULE &&
          !self.input_dongle.attachment &&
          !self.input_dongle.dragging &&
          self.hovering &&
          !dragging_obj
        )
        ||
        (
          self.type == MODULE_TYPE_RELATIONSHIP &&
          !self.input_dongle.attachment &&
          !self.input_dongle.dragging
        )
      )
      {
        safenormvec(self.input_dongle.off,-1,self.input_dongle.off);
        mulvec(self.input_dongle.off,20,self.input_dongle.off);
      }

      //bounce
      var t = 1-(advance_timer/advance_timer_max);

      self.v_vel += (self.v-self.v_lag)/5.;
      self.v_lag += self.v_vel;
      self.v_vel *= 0.9;

      if(
        ( self.input_dongle.attachment && self.output_dongle.attachment && self.last_t < 0.5 && t >= 0.5) ||
        (!self.input_dongle.attachment && self.output_dongle.attachment && (t < self.last_t || t == 0))
      )
      {
        self.val_s = 0.75;
        self.val_s_vel = 0.25;
      }
      self.val_s_vel += (1-self.val_s)/5.;
      self.val_s += self.val_s_vel;
      self.val_s_vel *= 0.9;

      if(t < self.last_t || t == 0)
      {
        self.blob_s = 0;
        self.blob_s_vel = 0.5;
      }
      self.blob_s_vel += (1-self.blob_s)/5.;
      self.blob_s += self.blob_s_vel;
      self.blob_s_vel *= 0.9;

      self.last_t = t;
    }
  }

  var deleteModule = function(mod)
  {
    var queued_delete = [];
    if(selected_module == mod)
      selected_module = 0;
    for(var i = 0; i < modules.length; i++)
    {
      if(modules[i].input_dongle.attachment  == mod) { modules[i].input_dongle.attachment = 0;  queued_delete.push(modules[i]); }
      if(modules[i].output_dongle.attachment == mod) { modules[i].output_dongle.attachment = 0; queued_delete.push(modules[i]); }
    }
    for(var i = 0; i < modules.length; i++)
      if(modules[i] == mod) modules.splice(i,1);
    for(var i = 0; i < queued_delete.length; i++)
      deleteModule(queued_delete[i]);
    s_editor.center();
  }
  var cloneModule = function(src,dst)
  {
    dst.wx = src.wx;
    dst.wy = src.wy;
    dst.ww = src.ww;
    dst.wh = src.wh;
    dst.x = src.x;
    dst.y = src.y;
    dst.w = src.w;
    dst.h = src.h;
    dst.title = src.title;
    dst.color = src.color;
    dst.primary = src.primary;
    dst.primary_index = src.primary_index;
    dst.lock_move = src.lock_move;
    dst.lock_input = src.lock_input;
    dst.lock_value = src.lock_value;
    dst.lock_min = src.lock_min;
    dst.lock_max = src.lock_max;
    dst.lock_pool = src.lock_pool;
    dst.lock_graph = src.lock_graph;
    dst.type = src.type;
    dst.v_default = src.v_default;
    dst.v = src.v;
    dst.v_temp = src.v_temp;
    dst.v_lag = src.v_lag;
    dst.v_vel = src.v_vel;
    dst.min = src.min;
    dst.max = src.max;
    dst.pool = src.pool;
    dst.graph = src.graph;
    dst.operator = src.operator;
    dst.sign = src.sign;
    dst.cache_const = src.cache_const;
    dst.cache_delta = src.cache_delta;
    dst.blob_s = src.blob_s;
    dst.blob_s_vel = src.blob_s_vel;
    dst.val_s = src.val_s_vel;
    dst.last_t = src.last_t;
    dst.prev_plot = src.prev_plot;
    dst.plot = src.plot;
    dst.input_dongle_vel = src.input_dongle_vel;
    dst.output_dongle_vel = src.output_dongle_vel;
    dst.input_dongle = src.input_dongle;
    dst.output_dongle = src.output_dongle;
    dst.body_cache = src.body_cache;
  }

  var refreshModule = function(mod)
  {
    mod.wx = 0;
    mod.wy = 0;
    mod.ww = 0;
    mod.wh = 0;
    mod.x = 0;
    mod.y = 0;
    mod.w = 0;
    mod.h = 0;

    mod.title = "";
    mod.color = good_colors[randIntBelow(good_colors.length)];
    mod.primary = false;
    mod.primary_index = 0;
    mod.lock_move = false;
    mod.lock_input = false;
    mod.lock_output = false;
    mod.lock_value = false;
    mod.lock_min = false;
    mod.lock_max = false;
    mod.lock_pool = false;
    mod.lock_graph = false;

    mod.type = MODULE_TYPE_MODULE;
    mod.v_default = 1;
    mod.v = 1;
    mod.v_temp = 1;
    mod.v_lag = mod.v;
    mod.v_vel = 0;
    mod.min = 0;
    mod.max =  10;
    mod.pool = 1;
    mod.graph = 1;

    mod.operator = OPERATOR_MUL;
    mod.sign = 1.;

    mod.cache_const = 0;
    mod.cache_delta = 0;

    mod.blob_s = 0;
    mod.blob_s_vel = 0.5;

    mod.val_s = 0.75;
    mod.val_s_vel = 0.25;

    mod.last_t = 1;

    mod.prev_plot = 0;
    mod.plot = [];

    mod.input_dongle_vel = {x:0,y:0};
    mod.output_dongle_vel = {x:0,y:0};

    mod.body_cache = {buffer:10};
  }

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    hoverer = new Hoverer({source:stage.dispCanv.canvas});
    keyer   = new Keyer(  {source:stage.dispCanv.canvas});
    blurer  = new Blurer( {source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};

    modules = [];
    selected_module = 0;
    dragging_obj = 0;
    full_pause = false;
    drag_pause = false;
    advance_timer_max = 100;
    advance_timer = advance_timer_max;
    t_i = 0;
    t_max = 10;
    n_ticks = 0;

    load_template_i = 0;
    templates = [];
    /*empty*/            templates.push("{\"modules\":[]}");
    /*feedback loop*/    templates.push("{\"modules\":[{\"title\":\"microphone\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":-0.478125,\"wy\":0.16874999999999993,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"amp\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.27812499999999996,\"wy\":0.15937500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"makes sound\",\"type\":2,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.08125000000000004,\"wy\":0.40312499999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0},{\"title\":\"records sound\",\"type\":2,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.12187499999999996,\"wy\":-0.05312500000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1}]}");
    /*normalizing loop*/ templates.push("{\"modules\":[{\"title\":\"bowl\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.275,\"wy\":0.046875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"kids\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.5125,\"wy\":0.09687499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"teachers\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.7562500000000002,\"wy\":0.36875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"each take jellybeans\",\"type\":2,\"v\":-1,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.034374999999999864,\"wy\":0.25625,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0},{\"title\":\"each put jellybeans into\",\"type\":2,\"v\":1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.74375,\"wy\":0.10625000000000007,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"output\":0},{\"title\":\"attracts kids\",\"type\":2,\"v\":0.9,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":0.09062499999999989,\"wy\":-0.12500000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1}]}");
    /*cycle*/            templates.push("{\"modules\":[{\"title\":\"rabbits\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.21562499999999996,\"wy\":0.2,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"eat\",\"type\":2,\"v\":-0.3,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.034375000000000044,\"wy\":0.4,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0},{\"title\":\"nourish\",\"type\":2,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1},{\"title\":\"breed\",\"type\":2,\"v\":10,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.6625,\"wy\":0.21874999999999994,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":0},{\"title\":\"die\",\"type\":2,\"v\":-10,\"min\":-10,\"max\":10,\"pool\":true,\"graph\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":1}]}");
    /*proportion cycle*/ templates.push("{\"modules\":[{\"title\":\"rabits\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"eat\",\"type\":2,\"v\":-0.4,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.009375000000000022,\"wy\":0.384375,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":0},{\"title\":\"nourish\",\"type\":2,\"v\":0.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1},{\"title\":\"breed\",\"type\":2,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.665625,\"wy\":0.19999999999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":0},{\"title\":\"die\",\"type\":2,\"v\":-0.2,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.5,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":1}]}");
    /*circle of life*/   templates.push("{\"modules\":[{\"title\":\"sun\",\"type\":1,\"v\":10,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.4125,\"wy\":0.1062499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"grass\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.81875,\"wy\":0.078125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"gives light\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.1204999999999998,\"wy\":0.09262500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"output\":1},{\"title\":\"herbivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.21425000000000005,\"wy\":0.08325000000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"nourishes\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.492375,\"wy\":0.20825,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"output\":3},{\"title\":\"eats\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.49550000000000005,\"wy\":-0.03862499999999991,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"output\":1},{\"title\":\"carnivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.3224999999999999,\"wy\":0.06737500000000013,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"output\":-1},{\"title\":\"nourishes\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.044375000000000164,\"wy\":0.2017500000000001,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"output\":6},{\"title\":\"eats\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.038125000000000075,\"wy\":-0.05762499999999995,\"ww\":0.15625,\"wh\":0.15625,\"input\":6,\"output\":3},{\"title\":\"\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.6540000000000006,\"wy\":0.07125000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":6,\"output\":6}]}");

    s_dragger = new screen_dragger();
    s_graph = new graph();
    s_graph.x = 0;
    s_graph.y = 0;
    s_graph.w = canv.width;
    s_graph.h = 160;
    s_graph.graph_w = 200;
    s_graph.calc_sub_params();
    s_ctrls = new controls();
    s_ctrls.w = 400;
    s_ctrls.h = 30;
    s_ctrls.x = canv.width-s_ctrls.w-10;
    s_ctrls.y = canv.height-s_ctrls.h-10;
    s_ctrls.calc_sub_params();
    s_ctrls.x = canv.width-s_ctrls.w-10;
    s_ctrls.calc_sub_params();
    s_editor = new module_editor();
    s_editor.x = canv.width-100;
    s_editor.y = 100;
    s_editor.w = 140;
    s_editor.h = 150;
    s_editor.calc_sub_params();

    blurb = new blurb_box();
    blurb.w = 400;
    blurb.h = 200;
    blurb.x = canv.width-blurb.w;
    blurb.y = canv.height;
    blurb.inviz_y = canv.height;
    blurb.viz_y = canv.height-blurb.h;

    var dragOutModule = function(type,btn,evt)
    {
      if(dragging_obj) return false;
      if(levels[cur_level_i] && levels[cur_level_i].should_allow_creation && !levels[cur_level_i].should_allow_creation(type)) return false;
      if(doEvtWithinBB(evt,btn))
      {
        var m = new module(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),worldSpaceW(work_cam,canv,module_s),worldSpaceH(work_cam,canv,module_s));
        m.type = type;
        if(type == MODULE_TYPE_RELATIONSHIP || type == MODULE_TYPE_GENERATOR)
        m.graph = 0;
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        modules.push(m);
        resetGraph();
      }
      return false;
    }

    add_module_btn = new btn();
    add_module_btn.w = 70;
    add_module_btn.h = 70;
    add_module_btn.x = 10;
    add_module_btn.y = canv.height-add_module_btn.h-10;
    add_module_btn.shouldDrag = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].add_module_enabled) return false;
      return dragOutModule(MODULE_TYPE_MODULE,add_module_btn,evt);
    }

    //kind of a hack- just placeholder that gets checked by modules themselves
    remove_module_btn = new btn();
    remove_module_btn.w = 80;
    remove_module_btn.h = 80;
    remove_module_btn.x = add_module_btn.x+add_module_btn.w+10;
    remove_module_btn.y = canv.height-remove_module_btn.h-10;

    menu_btn = new btn();
    menu_btn.h = 30;
    menu_btn.w = menu_btn_img.width*(menu_btn.h/menu_btn_img.height);
    menu_btn.x = canv.width-menu_btn.w-10;
    menu_btn.y = 10;
    menu_btn.click = function(evt)
    {
      game_state = GAME_STATE_MENU;
      if(blurb.g_viz == 1) blurb.dismiss();
    }

    next_level_btn = new btn();
    next_level_btn.h = 30;
    next_level_btn.w = next_level_btn_img.width*(next_level_btn.h/next_level_btn_img.height);
    next_level_btn.x = canv.width-next_level_btn.w-10;
    next_level_btn.y = 10+menu_btn.h+10;
    next_level_btn.click = function(evt)
    {
      if(levelComplete()) //nextLevel();
      {
        if(levels[cur_level_i]) levels[cur_level_i].complete = true;
        game_state = GAME_STATE_MENU;
        if(blurb.g_viz == 1) blurb.dismiss();
      }
    }

    print_btn = new btn();
    print_btn.w = 60;
    print_btn.h = 20;
    print_btn.x = canv.width-print_btn.w-10;
    print_btn.y = 10;
    print_btn.click = function(evt)
    {
      if(!ALLOW_SAVE && levels[cur_level_i] && !levels[cur_level_i].save_enabled) return false;
      if(!dragging_obj) print_template();
    }

    load_btn = new btn();
    load_btn.w = 60;
    load_btn.h = 40;
    load_btn.x = canv.width-load_btn.w-10;
    load_btn.y = 40;
    load_btn.click = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].load_enabled) return false;
      if(!dragging_obj)
      {
        load_next_template();
        resetGraph();
        selected_module = 0;
        s_editor.unfocus();
        full_pause = true;
      }
    }

    game_state = GAME_STATE_MENU;
    beginLevel();
    blurb.g_viz = 0;
  };

  var resetGraph = function()
  {
    for(var j = 0; j < 2 || (predict && j < t_max); j++)
    {
      t_i = 0;
      advance_timer = advance_timer_max;
      for(var i = 0; i < modules.length; i++)
      {
        modules[i].v = modules[i].v_default;
        modules[i].cache_delta = 0;
        modules[i].plot[0] = modules[i].v;
        modules[i].prev_plot = modules[i].plot[0];
      }
      if(j == 0)
      {
        for(var i = 0; i < t_max; i++)
          flow();
      }
    }
  }

  var calc_caches = function()
  {
    for(var i = 0; i < modules.length; i++)
      modules[i].cache_const = 1;
    for(var i = 0; i < modules.length; i++)
    {
      if(modules[i].output_dongle.attachment)
        modules[i].output_dongle.attachment.cache_const = 0;
    }
  }

  var flow = function()
  {
    if(t_i < t_max) t_i++;
    //t_i = (t_i+1)%t_max;

    for(var i = 0; i < modules.length; i++)
      modules[i].prev_plot = modules[i].plot[t_i];

    advance_timer = advance_timer_max;
    for(var i = 0; i < modules.length; i++)
    {
      if(modules[i].pool || modules[i].cache_const) modules[i].v_temp = modules[i].v;
      else                                          modules[i].v_temp = 0;
    }

    for(var i = 0; i < modules.length; i++)
    {
      if(modules[i].output_dongle.attachment)
      {
        if(modules[i].input_dongle.attachment)
        {
          if(modules[i].operator == OPERATOR_MUL) modules[i].output_dongle.attachment.v_temp += modules[i].input_dongle.attachment.v*(modules[i].v)*modules[i].sign;
          else                                    modules[i].output_dongle.attachment.v_temp += modules[i].input_dongle.attachment.v/(modules[i].v)*modules[i].sign;
        }
        else                                      modules[i].output_dongle.attachment.v_temp +=                                      (modules[i].v)*modules[i].sign;
      }
    }

    for(var i = 0; i < modules.length; i++)
    {
      modules[i].v_temp = fdisp(clamp(modules[i].min,modules[i].max,modules[i].v_temp),2);
      modules[i].cache_delta = fdisp(modules[i].v_temp-modules[i].v,2);
      modules[i].v = modules[i].v_temp;
      modules[i].plot[t_i] = modules[i].v;
    }
  }

  self.tick = function()
  {
    if(game_state == GAME_STATE_PLAY)
    {
      var clicked = false;
      if(clicker.filter(blurb))                  clicked = true;
      if(selected_module) if(s_editor.filter())  clicked = true;
      if(dragger.filter(s_ctrls.speed_slider))   clicked = true;
      if(clicker.filter(s_ctrls.pause_btn))      clicked = true;
      if(clicker.filter(s_ctrls.advance_btn))    clicked = true;
      if(clicker.filter(s_ctrls.reset_btn))      clicked = true;
      if(clicker.filter(s_ctrls.speed_slow_btn)) clicked = true;
      if(clicker.filter(s_ctrls.speed_med_btn))  clicked = true;
      if(clicker.filter(s_ctrls.speed_fast_btn)) clicked = true;
      if(clicker.filter(next_level_btn))         clicked = true;
      if(clicker.filter(menu_btn))               clicked = true;
      if(clicker.filter(print_btn))              clicked = true;
      if(clicker.filter(load_btn))               clicked = true;
      if(dragger.filter(add_module_btn))         clicked = true;
      clicker.filter(levels[cur_level_i]);
      if(!clicked)
      {
        for(var i = 0; i < modules.length; i++)
          if(!modules[i].lock_input) dragger.filter(modules[i].input_dongle);
        for(var i = 0; i < modules.length; i++)
          if(!modules[i].lock_output) dragger.filter(modules[i].output_dongle);
        for(var i = 0; i < modules.length; i++)
        {
          hoverer.filter(modules[i]);
          if(!modules[i].lock_move) dragger.filter(modules[i]);
        }
      }
      if(!clicked) dragger.filter(s_dragger);

      for(var i = 0; i < modules.length; i++)
        modules[i].cache_const = 1;
      for(var i = 0; i < modules.length; i++)
        if(modules[i].output_dongle.attachment) modules[i].output_dongle.attachment.cache_const = 0;

      var should_pause = false;
      if(
        s_editor.v_box.focused ||
        s_editor.min_box.focused ||
        s_editor.max_box.focused
      )
        should_pause = true;
      if(t_i >= t_max-1) should_pause = true;
      if(drag_pause) should_pause = true;
      if(full_pause && advance_timer == advance_timer_max) should_pause = true;
      if(!should_pause)
      {
        advance_timer--;
        if(advance_timer <= 0)
          flow();
      }

      for(var i = 0; i < modules.length; i++)
        modules[i].tick();
    }
    else if(game_state == GAME_STATE_MENU)
    {
      for(var i = 0; i < level_btns.length; i++)
        clicker.filter(level_btns[i]);
    }
    blurb.tick();
    s_ctrls.y = blurb.y-s_ctrls.h-10;
    s_ctrls.calc_sub_params();

    clicker.flush();
    dragger.flush();
    hoverer.flush();
    keyer.flush();
    blurer.flush();

    n_ticks++;
  };

  self.draw = function()
  {
    ctx.lineWidth = 1;
    //ctx.fillStyle = bg_color;
    //ctx.fillRect(0,0,canv.width,canv.height);
    ctx.drawImage(bg_img,0,0,canv.width,canv.height);

    if(game_state == GAME_STATE_PLAY)
    {
      calc_caches();

      ctx.lineWidth = 1;
      ctx.textAlign = "left";
      if(!levels[cur_level_i] || levels[cur_level_i].add_module_enabled)
        imageBox(add_btn_img,add_module_btn,ctx);
      if(dragging_obj && !dragging_obj.primary && dragging_obj != s_dragger && dragging_obj != s_editor && !dragging_obj.src) //src implies whippet
        imageBox(remove_btn_img,remove_module_btn,ctx);

      ctx.textAlign = "center";


      for(var i = 0; i < modules.length; i++)
        screenSpace(work_cam,canv,modules[i]);

      for(var i = 0; i < modules.length; i++)
        modules[i].drawLines();
      for(var i = 0; i < modules.length; i++)
        modules[i].drawBlob();
      for(var i = 0; i < modules.length; i++)
        modules[i].drawBody();
      for(var i = 0; i < modules.length; i++)
        modules[i].drawDongles();
      for(var i = 0; i < modules.length; i++)
        modules[i].drawValue();

      var tmp_pause = false;
      if(
        s_editor.v_box.focused ||
        s_editor.min_box.focused ||
        s_editor.max_box.focused
      )
        tmp_pause = true;
      if(t_i >= t_max-1) tmp_pause = true;
      if(drag_pause || full_pause || tmp_pause)
      {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0,0,canv.width,canv.height);
      }
      levels[cur_level_i].draw();
      ctx.lineWidth = 1;

      s_graph.draw();
      s_ctrls.draw();

      ctx.fillStyle = black;
      ctx.strokeStyle = black;
      ctx.lineWidth = 1;
      ctx.textAlign = "left";
      ctx.fillStyle = "#AAAAAA";
      if(levelComplete()) imageBox(next_level_btn_img,next_level_btn,ctx);
      imageBox(menu_btn_img,menu_btn,ctx);
      if(ALLOW_SAVE || !levels[cur_level_i] || levels[cur_level_i].save_enabled)
      {
        ctx.fillText("Save",print_btn.x+print_btn.w-2,print_btn.y+10);
        ctx.strokeRect(print_btn.x,print_btn.y,print_btn.w,print_btn.h);
      }
      if(!levels[cur_level_i] || levels[cur_level_i].load_enabled)
      {
        ctx.fillText("Load Next",load_btn.x+load_btn.w-2,load_btn.y+10);
        ctx.fillText("("+load_template_i+"/"+(templates.length-1)+")",load_btn.x+load_btn.w-2,load_btn.y+30);
        ctx.strokeRect(load_btn.x,load_btn.y,load_btn.w,load_btn.h);
      }

      ctx.textAlign = "left";
      if(selected_module) s_editor.draw();
      ctx.font = "10px Roboto Mono";
      if(levels[cur_level_i].speed_enabled)
      {
        ctx.fillStyle = black;
        ctx.fillText("Speed:",s_ctrls.speed_slider.x,s_ctrls.speed_slider.y-10);
        s_ctrls.speed_slider.draw(canv);
      }
    }
    else if(game_state == GAME_STATE_MENU)
    {
      ctx.fillStyle = white;
      ctx.font = "20px Roboto Mono";
      ctx.fillText("Computational Modelling",20,50);
      ctx.font = "12px Roboto Mono";
      for(var i = 0; i < level_btns.length; i++)
        level_btns[i].draw(levels[i],level_btns[i]);
      var x = 30;
      var y = 90;
      var h = 70;
      ctx.fillText("Grow a Tree",x,y); y += h+40;
      ctx.fillText("Natural Relationships",x,y); y += h+40;
      ctx.fillText("Complexity",x,y); y += h+40;
      ctx.fillText("Chain Reactions",x,y); y += h+40;
      ctx.fillText("Big Systems",x,y); y += h+40;
    }
    blurb.draw();
  };

  self.cleanup = function()
  {
  };

};

