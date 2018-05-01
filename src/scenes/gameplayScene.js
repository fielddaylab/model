var GamePlayScene = function(game, stage)
{
  var self = this;

  var ALLOW_NEXT = true;
  var ALLOW_SAVE = false;

  var precision = 2;
  var predict = false;

  ENUM = 0;
  var GAME_STATE_MENU  = ENUM; ENUM++;
  var GAME_STATE_PLAY  = ENUM; ENUM++;
  var GAME_STATE_MODAL = ENUM; ENUM++;
  var game_state;

  var line_color = "#0A182E";
  var graph_bg_vvlight_color = "#455C77";
  var graph_bg_vlight_color = "#263953";
  var graph_bg_light_color = "#2A3544";
  var graph_bg_med_color = "#1F2D3F";
  var graph_bg_dark_color = "#0F2742";
  var graph_bg_vdark_color = "#030D1B";
  var bg_color = "#485973";
  var bgbg_color = "#3E4D62";

  var green = "#92CF48";
  var red = "#AA0000";
  var white = "#FFFFFF";
  var black = "#000000";
  var brown = "#755232";
  var gray = "#DDDDDD";
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
  var clear_btn;
  var menu_btn
  var print_btn;
  var load_btn;
  var load_template_i;
  var templates;

  var s_dragger;
  var s_graphs;
  var s_ctrls;
  var s_editor;

  var blurb;
  var modal;

  var w;
  var h;

  var module_outline_s = 60;
  var module_s = 50;
  var module_fill_s = 45;
  var module_inner_s = 30;

  var good_colors = [];
  good_colors.push("#AFF865"); //light green
  good_colors.push("#87E2FF"); //pastel blue
  good_colors.push("#F5A623"); //orange
  good_colors.push("#FFF46F"); //yellow
  good_colors.push("#FFAEAE"); //pink
  good_colors.push("#E774FF"); //magenta
  good_colors.push("#ACF9D2"); //pastel gray/green
  good_colors.push("#FF6578"); //pastel red
  good_colors.push("#95F32E"); //green
  good_colors.push("#BDAEFF"); //pastel purple

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

  var lvl_imgs = [];
  for(var i = 0; i < 5; i++)
  {
    lvl_imgs[i] = new Image();
    lvl_imgs[i].src = "assets/level_"+i+".png";
  }

  var bg_img = new Image();
  bg_img.src = "assets/bg.jpg";
  var add_btn_img = new Image();
  add_btn_img.src = "assets/add_btn.png";
  var remove_btn_img = new Image();
  remove_btn_img.src = "assets/remove_btn.png";
  var menu_btn_img = new Image();
  menu_btn_img.src = "assets/menu_btn.png";
  var clear_btn_img = new Image();
  clear_btn_img.src = "assets/clear_btn.png";
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
  var reset_time_btn_img = new Image();
  reset_time_btn_img.src = "assets/reset_time_btn.png";
  var hex_bg_img = new Image();
  hex_bg_img.src = "assets/hex_bg.png";
  var hex_fill_img = new Image();
  hex_fill_img.src = "assets/hex_fill.png";
  var hex_neg_fill_img = new Image();
  hex_neg_fill_img.src = "assets/hex_fill.png";
  var wrong_img = new Image();
  wrong_img.src = "assets/wrong.png";
  var right_img = new Image();
  right_img.src = "assets/right.png";
  var close_img = new Image();
  close_img.src = "assets/close.png";
  var girl_img = new Image();
  girl_img.src = "assets/girl.png";
  var win_img = new Image();
  win_img.src = "assets/win.png";

  var on_img = GenIcon(40,40);
  on_img.context.lineWidth = 4;
  on_img.context.fillStyle = green;
  on_img.context.strokeStyle = gray;
  on_img.context.beginPath();
  on_img.context.arc(on_img.width/2,on_img.height/2,on_img.width/2-3,0,twopi);
  on_img.context.fill();
  on_img.context.stroke();
  //overwrite
  on_img = new Image();
  on_img.src = "assets/toggle_on.png";

  var off_img = GenIcon(40,40);
  off_img.context.lineWidth = 4;
  off_img.context.fillStyle = green;
  off_img.context.strokeStyle = gray;
  off_img.context.beginPath();
  off_img.context.arc(off_img.width/2,off_img.height/2,off_img.width/2-3,0,twopi);
  //off_img.context.fill();
  off_img.context.stroke();
  //overwrite
  off_img = new Image();
  off_img.src = "assets/toggle_off.png";

  var lock_img = GenIcon(40,40);
  lock_img.context.strokeStyle = white;
  lock_img.context.lineWidth = 2;
  strokeR(8,20,26,18,4,lock_img.context);
  lock_img.context.beginPath();
  lock_img.context.arc(21,20,10,0,pi,true);
  lock_img.context.stroke();
  lock_img.context.beginPath();
  lock_img.context.arc(21,27,4,quarterpi,-(pi+quarterpi),true);
  lock_img.context.lineTo(17,34);
  lock_img.context.lineTo(25,34);
  lock_img.context.closePath();
  lock_img.context.stroke();

  function fillLeftR(x,y,w,h,r,ctx)
  {
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w,y);
    ctx.lineTo(x+w,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
    ctx.fill();
  }
  function strokeLeftR(x,y,w,h,r,ctx)
  {
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w,y);
    ctx.lineTo(x+w,y+h);
    ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
    ctx.stroke();
  }
  function fillRightR(x,y,w,h,r,ctx)
  {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x,y+h);
    ctx.lineTo(x,y);
    ctx.closePath();
    ctx.fill();
  }
  function strokeRightR(x,y,w,h,r,ctx)
  {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x,y+h);
    ctx.lineTo(x,y);
    ctx.closePath();
    ctx.stroke();
  }

  var audio = new Audio("assets/blip.mp3");

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
    self.complete = false; //once level is complete, never gets set to false again
    self.finished = false; //finished is set to false every time you start level
    self.click = function(){ self.dismissed++; };
    self.comic = false;
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
    if(s_ctrls.speed_med_btn) s_ctrls.speed_med_btn.click({});
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
    levels[cur_level_i].finished = false;
    beginLevel();
  }

  var genCode = function()
  {
    var c = "";
    for(var i = 0; i < levels.length; i++)
      c += levels[i].complete ? "1" : "0";
    return c;
  }

  var consumeCode = function(c)
  {
    var cbit;
    for(var i = 0; i < levels.length; i++)
    {
      cbit = c.substr(0,1);
      c = c.substr(1);
      levels[i].complete = cbit == "1" ? 1 : 0;
    }
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
  l.comic = function() { /*game.setScene(2,{start:1,length:1});*/ };
  levels.push(l);

  l = new level();
  l.title = "Watch";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.7045454545454546,\"wy\":0.20181818181818184,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.013636363636363849,\"wy\":0.20181818181818184,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"\",\"img_name\":\"undefined\",\"color\":\"#FF6578\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.3454545454545455,\"wy\":0.20636363636363642,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true}]}";
  l.primary_module_target_titles.push("Height(M)");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    selected_module = undefined;
    if(s_ctrls.speed_slow_btn) s_ctrls.speed_slow_btn.click({});
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Source";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.7227272727272729,\"wy\":0.19500000000000006,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.03863636363636376,\"wy\":0.15181818181818185,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"\",\"img_name\":\"undefined\",\"color\":\"#87E2FF\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.3204545454545456,\"wy\":0.16545454545454552,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true}]}";
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
      blurb.enq(["This model doesn't conform to our data... Select the Sunlight & CO₂ module and set its value to fix it!"],[{title:"Sunlight & CO₂"}]);
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Start";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.7204545454545455,\"wy\":0.22909090909090912,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":2,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.006818181818181654,\"wy\":0.24272727272727274,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"\",\"img_name\":\"undefined\",\"color\":\"#FFF46F\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.3818181818181819,\"wy\":0.22454545454545466,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true}]}";
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
      blurb.enq(["This model doesn't conform to our data... Select the Tree Height module and set its starting value."],[{title:"Tree Height (M)"}]);
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Build a Tree";
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Rate";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":0.7068181818181816,\"wy\":0.14500000000000007,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":0,\"wx\":-0.006818181818181682,\"wy\":0.14500000000000007,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Grows\",\"img_name\":\"undefined\",\"color\":\"#BDAEFF\",\"type\":2,\"v\":0.5,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.3363636363636365,\"wy\":0.1954545454545455,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
  l.primary_module_target_titles.push("Plants");
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = true;
  l.ready = function()
  {
    selected_module = undefined;
    if(s_ctrls.speed_fast_btn) s_ctrls.speed_fast_btn.click({});
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
      blurb.enq(["This model doesn't conform to our data... Select the Grows relationship and modify its multiplier."],[{title:"Grows"}]);
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Two ways";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":80,\"pool\":1,\"graph\":1,\"wx\":0.8022727272727274,\"wy\":0.201818181818182,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.015909090909091053,\"wy\":0.20863636363636362,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Grows\",\"img_name\":\"undefined\",\"color\":\"#FFF46F\",\"type\":2,\"v\":0.5,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.3454545454545456,\"wy\":0.27727272727272734,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
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
      blurb.enq(["This model doesn't conform to our data... Find a way to modify it so that it does! Hint: There's more than one solution!"]);
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Connect the dots";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":0.7499999999999998,\"wy\":0.15409090909090917,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.011363636363635979,\"wy\":0.15863636363636358,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false}]}";
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
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Multiple Sources";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Greenhouse Effect\",\"img_name\":\"undefined\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.7454545454545455,\"wy\":0.09772727272727279,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cars\",\"img_name\":\"undefined\",\"color\":\"#ACF9D2\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.07954545454545432,\"wy\":0.32727272727272727,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cows\",\"img_name\":\"undefined\",\"color\":\"#F5A623\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.08409090909090884,\"wy\":-0.08409090909090913,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO₂ Emissions\",\"img_name\":\"undefined\",\"color\":\"#95F32E\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.3431818181818182,\"wy\":0.30909090909090897,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Methane Release\",\"img_name\":\"undefined\",\"color\":\"#BDAEFF\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.33409090909090916,\"wy\":-0.07727272727272719,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
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
    blurb.enq(["Multiple objects can have an additive effect."]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
  }
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Counteracting Sources";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Greenhouse Effect\",\"img_name\":\"undefined\",\"color\":\"#F5A623\",\"type\":0,\"v\":1,\"min\":0,\"max\":20,\"pool\":1,\"graph\":1,\"wx\":0.7045454545454545,\"wy\":0.12727272727272726,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cars\",\"img_name\":\"undefined\",\"color\":\"#FFAEAE\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.09090909090909087,\"wy\":0.37045454545454526,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Cows\",\"img_name\":\"undefined\",\"color\":\"#FFF46F\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.1045454545454542,\"wy\":-0.10909090909090913,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Trees\",\"img_name\":\"assets/tree.png\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":-0.11136363636363626,\"wy\":0.15681818181818208,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO₂ Emissions\",\"img_name\":\"undefined\",\"color\":\"#AFF865\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":0,\"wx\":0.3,\"wy\":0.34772727272727266,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"Methane Release\",\"img_name\":\"undefined\",\"color\":\"#FFF46F\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.28863636363636375,\"wy\":-0.08636363636363659,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"CO₂ Scrubbing\",\"img_name\":\"undefined\",\"color\":\"#87E2FF\",\"type\":2,\"v\":-1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":0,\"wx\":0.28636363636363654,\"wy\":0.13863636363636372,\"ww\":0.1136,\"wh\":0.1136,\"input\":3,\"output\":0,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":true,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
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
    blurb.enq(["Some relationships inversely affect their output."]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
  }
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Chain Reaction";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Plants\",\"img_name\":\"undefined\",\"color\":\"#95F32E\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.3659090909090909,\"wy\":0.09090909090909101,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Bugs\",\"img_name\":\"undefined\",\"color\":\"#FFAEAE\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.8,\"wy\":0.07045454545454548,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"Sunlight & CO₂\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":3,\"v\":10,\"min\":0,\"max\":50,\"pool\":1,\"graph\":1,\"wx\":-0.08863636363636344,\"wy\":0.08863636363636358,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":true},{\"title\":\"feed\",\"img_name\":\"undefined\",\"color\":\"#FFF46F\",\"type\":2,\"v\":0.1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":0.6136363636363634,\"wy\":0.20454545454545464,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1,\"lock_move\":false,\"lock_input\":false,\"lock_output\":false,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
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
    blurb.enq(["Chain reactions have compounding results- which can be hard to predict. Try to focus on getting one piece right at a time!"]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_ctrls.advance_btn)) levels[cur_level_i].dismissed++;
  }
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Polynomial Growth";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Minnow Population\",\"img_name\":\"undefined\",\"color\":\"#FFAEAE\",\"type\":3,\"v\":1,\"min\":0,\"max\":30,\"pool\":1,\"graph\":1,\"wx\":0.4204545454545454,\"wy\":0.10863636363636352,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Walleye Population\",\"img_name\":\"undefined\",\"color\":\"#FFAEAE\",\"type\":0,\"v\":1,\"min\":0,\"max\":30,\"pool\":1,\"graph\":1,\"wx\":0.8249999999999997,\"wy\":0.09499999999999988,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"DNR Minnow Dump\",\"img_name\":\"undefined\",\"color\":\"#95F32E\",\"type\":3,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.11136363636363632,\"wy\":0.10863636363636368,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"\",\"img_name\":\"undefined\",\"color\":\"#F5A623\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.1477272727272727,\"wy\":0.2063636363636363,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
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
    blurb.enq(["Even simple releationships result in growth that... grows!"]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
  }
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Understanding Polynomial Growth";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Minnow Population\",\"img_name\":\"undefined\",\"color\":\"#BDAEFF\",\"type\":3,\"v\":1,\"min\":0,\"max\":30,\"pool\":1,\"graph\":1,\"wx\":0.42045454545454564,\"wy\":0.07227272727272728,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":false,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"Walleye Population\",\"img_name\":\"undefined\",\"color\":\"#FFAEAE\",\"type\":0,\"v\":1,\"min\":0,\"max\":30,\"pool\":1,\"graph\":1,\"wx\":0.8113636363636363,\"wy\":0.0677272727272727,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":true,\"lock_min\":true,\"lock_max\":true,\"lock_pool\":true,\"lock_graph\":false},{\"title\":\"DNR Minnow Dump\",\"img_name\":\"undefined\",\"color\":\"#F5A623\",\"type\":3,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.1249999999999999,\"wy\":0.07227272727272728,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false},{\"title\":\"\",\"img_name\":\"undefined\",\"color\":\"#E774FF\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.1409090909090911,\"wy\":0.17681818181818176,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":0,\"lock_move\":false,\"lock_input\":true,\"lock_output\":true,\"lock_value\":false,\"lock_min\":false,\"lock_max\":false,\"lock_pool\":false,\"lock_graph\":false}]}";
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
    blurb.enq(["With more complex relationships, you can use trial and error to see how different values effect the shapes of the resulting graphs."]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
  }
  l.comic = false;
  levels.push(l);

  l = new level();
  l.title = "Big System";
  l.primary_module_template = "{\"modules\":[{\"title\":\"Grass\",\"img_name\":\"undefined\",\"color\":\"#E774FF\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.11306818181818198,\"wy\":0.2508522727272726,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Herbivores\",\"img_name\":\"\",\"color\":\"#E774FF\",\"type\":3,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.12106818181818203,\"wy\":-0.04402272727272705,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":false,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Carnivores\",\"img_name\":\"undefined\",\"color\":\"#FF6578\",\"type\":3,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.31113636363636354,\"wy\":-0.07353409090909069,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"Sun\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":0,\"v\":10,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.7784090909090912,\"wy\":0.2948863636363635,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"gives light\",\"img_name\":\"undefined\",\"color\":\"#AFF865\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":0.4522272727272729,\"wy\":0.3380795454545457,\"ww\":0.1136,\"wh\":0.1136,\"input\":3,\"output\":0,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"nourishes\",\"img_name\":\"undefined\",\"color\":\"#ACF9D2\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.05373863636363643,\"wy\":0.16506818181818206,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"eats\",\"img_name\":\"undefined\",\"color\":\"#AFF865\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.12220454545454563,\"wy\":0.27415909090909135,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0},{\"title\":\"dies\",\"img_name\":\"undefined\",\"color\":\"#87E2FF\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":false,\"graph\":false,\"wx\":0.6812727272727278,\"wy\":-0.08102272727272714,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":2,\"lock_move\":0,\"lock_input\":0,\"lock_output\":0,\"lock_value\":0,\"lock_min\":0,\"lock_max\":0,\"lock_pool\":0,\"lock_graph\":0}]}";
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
    blurb.enq(["Some relationships feed back on themselves- look for relationships between similar objects for hints!"]);
  }
  l.should_dismiss_blurb = function()
  {
    return true;
  }
  l.draw = function()
  {
    if(levelComplete() && t_i >= 4)
    {
      if(blurb.g_viz != 1)
        blurb.enq(["Simulation Complete! Click \"Next Level\""]);
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_ctrls.advance_btn)) levels[cur_level_i].dismissed++;
  }
  l.comic = false;
  levels.push(l);

  var w = 195;
  var in_w = 62;
  var h = 70;
  var x = 20;
  var y = 80-h-20;
  var row = 0;
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
      img:lvl_imgs[(row+4)%5],
      fill_color:fill_colors[color_i],
      stroke_color:stroke_colors[color_i],
      prev_level:levels[i-1],
      level:levels[i],
      click:function(evt)
      {
        if(!ALLOW_NEXT && (evt.clickable.prev_level && !evt.clickable.prev_level.complete)) return;
        game_state = GAME_STATE_PLAY;
        cur_level_i = evt.clickable.i;
        beginLevel();
        if(levels[cur_level_i].comic) levels[cur_level_i].comic();
      },
      draw:function(level,self)
      {
        ctx.fillStyle = self.fill_color;
        fillRightR(self.x+in_w,self.y,self.w-in_w,self.h,20,ctx);
        ctx.strokeStyle = self.stroke_color;
        strokeLeftR(self.x,self.y,in_w,self.h,20,ctx);
        strokeRightR(self.x+in_w,self.y,self.w-in_w,self.h,20,ctx);
        strokeRBox(self,20,ctx);
        ctx.font = "10px Roboto Mono";
        ctx.fillStyle = white;
        var i = level.title.indexOf(" ");
        if(i > 0)
        {
          ctx.fillText(level.title.substr(0,i),self.x+in_w+10,self.y+25);
          ctx.fillText(level.title.substr(i+1),self.x+in_w+10,self.y+45);
        }
        else
          ctx.fillText(level.title,self.x+in_w+10,self.y+25);
        if(self.prev_level && !self.prev_level.complete)
          ctx.drawImage(lock_img,self.x+10,self.y+10,40,40);
        else if(self.img)
        {
          var w = 40;
          var h = self.img.height*(w/self.img.width);
          var cx = self.x+30;
          var cy = self.y+35;
          ctx.drawImage(self.img,cx-w/2,cy-h/2,w,h);
        }
        if(level.complete)
          ctx.drawImage(right_img,self.x+self.w-30,self.y-10,30,30);
      }
    };
    level_btns.push(btn);

    x += w+20;
    switch(i)
    {
      case 0:
      case 4:
      case 7:
      case 9:
      case 12:
        { x = 20; y += h+40; row++; color_i++; }
        break;
    }
    if(x+w > canv.width) { x = 20; y += h+40; }
  }
  level_btns[0].x = canv.width-w-20;
  level_btns[0].y = canv.height-h-20;
  levels[0].complete = true;

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
    self.a_q = [];
    self.q_i = 0;
    self.a_t = 0;

    var font_size = 14;
    var font = font_size+"px Roboto Mono";
    self.dom = new CanvDom(canv);

    self.enq = function(txt,arrow)
    {
      self.q = txt;
      self.a_q = arrow;
      self.q_i = 0;
      self.g_viz = 1;
      self.dom.popDismissableMessage(textToLines(canv, font, self.w-160, self.q[self.q_i]),self.x+20,self.y+15,self.w-80,self.h,function(){});
    }

    self.dismiss = function()
    {
      if(self.q_i < self.q.length-1)
      {
        self.q_i++;
        self.dom.popDismissableMessage(textToLines(canv, font, self.w-160, self.q[self.q_i]),self.x+20,self.y+15,self.w-80,self.h,function(){});
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
      self.a_t++;
      if(self.a_t > 1000) self.a_t -= 1000;
    }

    self.click = function()
    {
      if(levels[cur_level_i] && levels[cur_level_i].should_dismiss_blurb && !levels[cur_level_i].should_dismiss_blurb()) return;
      self.dismiss();
    }

    self.draw = function()
    {
      ctx.strokeStyle = graph_bg_med_color;
      ctx.fillStyle = graph_bg_light_color;
      self.h -= 10;
      self.w -= 10;
      fillRBox(self,20,ctx);
      strokeRBox(self,20,ctx);
      self.h += 10;
      self.w += 10;
      ctx.font = font;
      ctx.fillStyle = white;
      self.dom.draw(font_size+4,canv);
      var w = 160;
      ctx.drawImage(girl_img,self.x+self.w-w-20,self.y+20,w,girl_img.height*(w/girl_img.width));
      if(self.g_viz && self.a_q && self.a_q[self.q_i])
      {
        var a = self.a_q[self.q_i];
        var m = 0;
        for(var i = 0; !m && i < modules.length; i++)
          if(a.title == modules[i].title) m = modules[i];

        if(m)
        {
          var x = m.x+m.w/2;
          var y = m.y+m.h/2;
          ctx.lineWidth = 10;
          ctx.strokeStyle = white;
          var d = sin(self.a_t/1000*twopi*8)*10;
          drawArrow(canv,x+100+d,y-100-d,x+50+d,y-50-d,20);
        }
      }
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
      self.reset_btn.w = reset_time_btn_img.width*(self.reset_btn.h/reset_time_btn_img.height);
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
      if(t_i != 0) imageBox(reset_time_btn_img,self.reset_btn,ctx);
      if(full_pause) imageBox(next_step_btn_img,self.advance_btn,ctx);
      if(advance_timer_max == 250) imageBox(speed_slow_btn_down_img,self.speed_slow_btn,ctx); else imageBox(speed_slow_btn_img,self.speed_slow_btn,ctx);
      if(advance_timer_max == 100) imageBox(speed_med_btn_down_img, self.speed_med_btn,ctx);  else imageBox(speed_med_btn_img, self.speed_med_btn,ctx);
      if(advance_timer_max ==  10) imageBox(speed_fast_btn_down_img,self.speed_fast_btn,ctx); else imageBox(speed_fast_btn_img,self.speed_fast_btn,ctx);
    }
  }

  var graphs = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.module_w = 0;
    self.module_h = 0;
    self.bg_w = 0;
    self.bg_h = 0;
    self.graph_w = 0;
    self.graph_h = 0;

    self.graph_p = 20;
    self.graph_r = 10;
    self.graph_b = 20;

    self.off_x = 0;
    self.off_y = 0;

    self.calc_sub_params = function()
    {
      self.module_w = self.w-20;
      self.module_h = self.module_w*0.8;
      self.bg_w = self.module_w-self.graph_b;
      self.bg_h = self.module_h-self.graph_b;
      self.graph_w = self.bg_w-20;
      self.graph_h = self.bg_h-20;
    }

    self.draw = function()
    {
      var x = 0;
      var y = 0;

      var graph_i = 0;

      for(var i = 0; i < modules.length; i++)
      {
        if(!modules[i].graph) continue;
        var mx = self.x + self.graph_p + self.off_x;// + (graph_i * (self.module_w + self.graph_p));
        var my = self.y + self.graph_p + self.off_y + (graph_i * (self.module_h + self.graph_p));

        //b[xy] and g[xy] are relative to m[xy]; m[xy] is absolute!
        var bx = self.graph_b;
        var by = 0;
        var gx = bx + self.graph_b;
        var gy = by;

        if(!modules[i].cache_graph)
        {
          modules[i].cache_graph = GenIcon(self.module_w,self.module_h);
          var mctx = modules[i].cache_graph.context;

          //bg
          mctx.fillStyle = graph_bg_dark_color;
          fillR(bx,by,self.bg_w,self.bg_h,self.graph_r,mctx);

          //graph squares
          mctx.fillStyle = graph_bg_vlight_color;
          var x;
          var y;
          var w = self.graph_w/(t_max-1);
          var y_max = modules[i].max-min(0,modules[i].min);
          var h = self.graph_h/y_max;
          for(var j = 0; j < (t_max-1); j++)
          {
            x = gx + j*w;
            for(var k = 0; k < y_max; k++)
            {
              y = gy + k*h;
              if(y_max > 20)
              {
                if(k == 1) k += 3; else k += 4;
                mctx.fillRect(x+1,y+1,w-2,h*5-2);
              }
              else
                mctx.fillRect(x+1,y+1,w-2,h-2);
            }
          }

          //labels
          mctx.fillStyle = modules[i].color;
          mctx.textAlign = "center";
          mctx.font = "10px Roboto Mono";
          mctx.save();
          mctx.translate(10,self.module_h/2);
          mctx.rotate(-halfpi);
          mctx.fillText(modules[i].title,0,0);
          mctx.restore();
          mctx.fillText("time",self.module_w/2,self.module_h-4);

          //axis numbers
          mctx.fillStyle = white;
          for(var j = 1; j < (t_max-1); j++)
          {
            x = gx + j*w;
            mctx.fillText(""+j, x, gy+self.graph_h+10);
          }
          for(var j = 1; j < y_max; j++)
          {
            y = gy+self.graph_h - j*h;
            mctx.fillText(""+j, gx-10, y+5);
            if(y_max > 10) if(j == 1) j += 3; else j += 4;
          }

          //line
          mctx.strokeStyle = modules[i].color;
          mctx.fillStyle = modules[i].color;
          x = gx;
          y = gy+self.graph_h;
          mctx.beginPath();
          if(!isNaN(modules[i].plot[0])) y = gy+self.graph_h - clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,modules[i].plot[0]))*self.graph_h;
          mctx.moveTo(x,y);
          for(var j = 0; j <= t_i || (predict && j < t_max); j++)
          {
            x = gx + (j/(t_max-1)) * self.graph_w;
            if(!isNaN(modules[i].plot[j])) y = gy+self.graph_h - clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,modules[i].plot[j]))*self.graph_h;
            mctx.lineTo(x,y);
            if(j == t_i)
            {
              if(!isNaN(modules[i].prev_plot)) y = gy+self.graph_h - clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,modules[i].prev_plot))*self.graph_h;
              mctx.lineTo(x,y);
            }
          }
          mctx.stroke();

          //points
          if(levels[cur_level_i] && levels[cur_level_i].primary_module_target_vals[i])
          {
            var targets = levels[cur_level_i].primary_module_target_vals[i];
            for(var j = 0; j < targets.length || !isNaN(modules[i].plot[j]); j++)
            {
              x = gx + (j/(t_max-1)) * self.graph_w;
              if(j < targets.length)
              {
                y = gy + self.graph_h - (clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,targets[j]))*self.graph_h);
                mctx.beginPath();
                mctx.arc(x,y,4,0,twopi);
                var off = -8;
                if(j <= t_i && !isNaN(modules[i].plot[j]) && modules[i].plot[j] == targets[j])
                  mctx.fill();
                else
                {
                  mctx.stroke();
                  if(j <= t_i && modules[i].plot[j] > targets[j]) off = 14;
                }

                mctx.font = "10px Roboto Mono";
                mctx.textAlign = "center";
                mctx.fillStyle = white;
                mctx.fillText(fdisp(targets[j],1),x,y+off);
                mctx.font = "20px Roboto Mono";
                mctx.textAlign = "left";
                mctx.fillStyle = modules[i].color;
              }
              if(j <= t_i && !isNaN(modules[i].plot[j]))
              {
                if((j < targets.length && modules[i].plot[j] != targets[j]) || j >= targets.length)
                {
                  mctx.font = "10px Roboto Mono";
                  mctx.textAlign = "center";
                  mctx.fillStyle = white;
                  y = self.graph_h - (clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,modules[i].plot[j]))*self.graph_h);
                  var off = 14;
                  if(j < targets.length && modules[i].plot[j] > targets[j]) off = -8;
                  mctx.fillText(fdisp(modules[i].plot[j],1),x,y+off);
                  mctx.font = "20px Roboto Mono";
                  mctx.textAlign = "left";
                  mctx.fillStyle = modules[i].color;
                  if(j < targets.length)
                    mctx.drawImage(wrong_img,x-5,y-5,10,10);
                }
              }
            }
          }
          else
          {
            for(var j = 0; !isNaN(modules[i].plot[j]); j++)
            {
              x = gx + (j/(t_max-1)) * self.graph_w;
              if(j <= t_i && !isNaN(modules[i].plot[j]))
              {
                mctx.font = "10px Roboto Mono";
                mctx.textAlign = "center";
                mctx.fillStyle = white;
                y = gy + self.graph_h - (clamp(0,1,mapVal(min(0,modules[i].min),modules[i].max,0,1,modules[i].plot[j]))*self.graph_h);
                var off = -8;
                if(j%2) off = 14;
                mctx.fillText(fdisp(modules[i].plot[j],1),x,y+off);
                mctx.font = "20px Roboto Mono";
                mctx.textAlign = "left";
                mctx.fillStyle = modules[i].color;
              }
            }
          }
        }
        ctx.drawImage(modules[i].cache_graph,mx,my,self.module_w,self.module_h);

        //playhead
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#888888";
        var x = mx + gx + ((t_i+(1-(advance_timer/advance_timer_max)))/(t_max-1)) * self.graph_w;
        ctx.beginPath();
        ctx.moveTo(x,my+gy);
        ctx.lineTo(x,my+gy+self.graph_h);
        ctx.stroke();

        graph_i++;
      }
      ctx.textAlign = "center";

    }

    self.drag_start_off_y = 0;
    self.drag_start_y = 0;
    self.shouldDrag = function(evt)
    {
      var n_graphs = 0;
      for(var i = 0; i < modules.length; i++) if(modules[i].graph) n_graphs++;
      if(evt.x > self.x && evt.x < self.x+self.w &&
         evt.y > self.y && evt.y < self.y+((self.module_h+self.graph_p)*n_graphs)+self.off_y) return true;
         return false;
    }
    self.dragStart = function(evt)
    {
      self.drag_start_off_y = self.off_y;
      self.drag_start_y = evt.doY;
    }
    self.drag = function(evt)
    {
      var n_graphs = 0;
      for(var i = 0; i < modules.length; i++) if(modules[i].graph) n_graphs++;
      self.off_y = self.drag_start_off_y+(evt.doY-self.drag_start_y);
      if(self.off_y < self.h-((self.module_h+self.graph_p)*n_graphs)-50) self.off_y = self.h-((self.module_h+self.graph_p)*n_graphs)-50;
      if(self.off_y > 0) self.off_y = 0;
    }
    self.dragFinish = function(evt)
    {

    }
  }

  var module_editor = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.title_box = new TextBox(0,0,0,0,"",18,function(v){ if(selected_module.primary) return; var new_v = v; var old_v = selected_module.title; selected_module.title = new_v; resetGraph(); });
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
    self.pool_box.on_img = on_img;
    self.pool_box.off_img = off_img;
    self.graph_box = new ToggleBox(0,0,0,0,0,  function(v){ if(selected_module.lock_graph) return; var new_v = v;                                                         var old_v = selected_module.graph;     selected_module.graph     = new_v; });
    self.graph_box.on_img = on_img;
    self.graph_box.off_img = off_img;

    self.operator_box_mul = new ToggleBox(0,0,0,0,0,function(v){ var new_v; if(v) new_v = OPERATOR_MUL; else new_v = OPERATOR_DIV; var old_v = selected_module.operator; selected_module.operator = new_v; if(new_v != old_v) resetGraph(); if(self.operator_box_div.on == v) self.operator_box_div.set(!v); });
    self.operator_box_mul.on_img = on_img;
    self.operator_box_mul.off_img = off_img;
    self.sign_box_pos = new ToggleBox(0,0,0,0,0,function(v){ var new_v; if(v) new_v = 1.; else new_v = -1.; var old_v = selected_module.sign; selected_module.sign = new_v; if(new_v != old_v) resetGraph(); if(self.sign_box_neg.on == v) self.sign_box_neg.set(!v); });
    self.sign_box_pos.on_img = on_img;
    self.sign_box_pos.off_img = off_img;
    self.operator_box_div = new ToggleBox(0,0,0,0,0,function(v){ if(self.operator_box_div.on == v) self.operator_box_mul.set(!v); });
    self.operator_box_div.on_img = on_img;
    self.operator_box_div.off_img = off_img;
    self.sign_box_neg = new ToggleBox(0,0,0,0,0,function(v){ if(self.sign_box_pos.on == v) self.sign_box_pos.set(!v); });
    self.sign_box_neg.on_img = on_img;
    self.sign_box_neg.off_img = off_img;
    self.del_btn = new ButtonBox(0,0,0,0,function(v){
      deleteModule(selected_module);
      selected_module = 0;
      dragging_obj = 0;
      resetGraph();
    });

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
          self.pool_box.w = w*1.4;
          self.pool_box.h = h;
          self.pool_box.x = self.x + self.w - self.pool_box.w - s;
          self.pool_box.y = self.y + s + (h+s)*i;
          i++;
        }

        if(!selected_module.lock_graph)
        {
          self.graph_box.w = w*1.4;
          self.graph_box.h = h;
          self.graph_box.x = self.x + self.w - self.graph_box.w - s;
          self.graph_box.y = self.y + s + (h+s)*i;
          i++;
        }

        if(selected_module.input_dongle.attachment && !selected_module.cache_const)
        {
          self.operator_box_mul.w = self.w/2-s;
          self.operator_box_mul.h = h;
          self.operator_box_mul.x = self.x + s;
          self.operator_box_mul.y = self.y + s + (h+s)*i;

          self.operator_box_div.w = self.w/2-s;
          self.operator_box_div.h = h;
          self.operator_box_div.x = self.x + self.w/2;
          self.operator_box_div.y = self.y + s + (h+s)*i;
          i++;

          self.sign_box_pos.w = self.w/2-s;
          self.sign_box_pos.h = h;
          self.sign_box_pos.x = self.x + s;
          self.sign_box_pos.y = self.y + s + (h+s)*i;

          self.sign_box_neg.w = self.w/2-s;
          self.sign_box_neg.h = h;
          self.sign_box_neg.x = self.x + self.w/2;
          self.sign_box_neg.y = self.y + s + (h+s)*i;
          i++;
        }

        if(!selected_module.primary)
        {
          self.del_btn.w = self.w-2*s;
          self.del_btn.h = h;
          self.del_btn.x = self.x + s;
          self.del_btn.y = self.y + s + (h+s)*i;
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
      if(!selected_module || (dragging_obj && dragging_obj != self))
        return false;

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

      if(clicker.filter(self.del_btn)) hit = true;

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
    self.drawLeftAlign = function(obj)
    {
      obj.draw(canv);
    }
    var prevy = 0;
    var drawPrevLine = function(new_prevy)
    {
      ctx.strokeStyle = gray;
      ctx.beginPath();
      ctx.moveTo(self.x,prevy);
      ctx.lineTo(self.x+self.w,prevy);
      ctx.stroke();
      prevy = new_prevy;
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
        { self.title_box.draw(canv); if(!self.title_box.txt.length) { ctx.fillText("(untitled)",self.title_box.x+4,self.title_box.y+self.title_box.h*3/4); } prevy = self.title_box.y+self.title_box.h+5; }
        if(!selected_module.lock_value)
        {
          self.drawRightAlign(self.v_box);
          ctx.fillStyle = black;
          if(selected_module.output_dongle.attachment && selected_module.input_dongle.attachment)
          {  ctx.fillText("multiplier",   self.x + 10, self.v_box.y+label_yoff); drawPrevLine(self.v_box.y+self.v_box.h+5); }
          else if(selected_module.output_dongle.attachment)
          { ctx.fillText("contribution",   self.x + 10, self.v_box.y+label_yoff); drawPrevLine(self.v_box.y+self.v_box.h+5); }
          else if(!selected_module.output_dongle.attachment)
          {
            if(!selected_module.cache_const)
              ctx.fillText("starting",   self.x + 10, self.v_box.y+label_yoff);
            else
              ctx.fillText("value", self.x + 10, self.v_box.y+label_yoff);
            drawPrevLine(self.v_box.y+self.v_box.h+5);
          }
        }
        if(!selected_module.cache_const)
        {
          if(!selected_module.lock_min) { self.drawRightAlign(self.min_box); ctx.fillStyle = black; ctx.fillText("min value", self.x + 10, self.min_box.y+label_yoff); drawPrevLine(self.min_box.y+self.min_box.h+5); }
          if(!selected_module.lock_max) { self.drawRightAlign(self.max_box); ctx.fillStyle = black; ctx.fillText("max value", self.x + 10, self.max_box.y+label_yoff); drawPrevLine(self.max_box.y+self.max_box.h+5); }
        }
        if(!selected_module.cache_const && !selected_module.lock_pool) { self.drawRightAlign(self.pool_box);  ctx.fillStyle = black; ctx.fillText("pool",  self.x + 10, self.pool_box.y+label_yoff);  drawPrevLine(self.pool_box.y+self.pool_box.h+5); }
        if(!selected_module.lock_graph)                                { self.drawRightAlign(self.graph_box); ctx.fillStyle = black; ctx.fillText("graph", self.x + 10, self.graph_box.y+label_yoff); drawPrevLine(self.graph_box.y+self.graph_box.h+5); }

        if(selected_module.input_dongle.attachment && !selected_module.cache_const)
        {
          ctx.strokeStyle = gray;
          if(self.operator_box_mul.on) ctx.fillStyle = green;
          else                         ctx.fillStyle = white;
          fillRBox(self.operator_box_mul,5,ctx);
          strokeRBox(self.operator_box_mul,5,ctx);
          if(self.operator_box_div.on) ctx.fillStyle = green;
          else                         ctx.fillStyle = white;
          fillRBox(self.operator_box_div,5,ctx);
          strokeRBox(self.operator_box_div,5,ctx);
          ctx.fillStyle = black;
          ctx.textAlign = "left";
          ctx.fillText("multiply", self.operator_box_mul.x+5, self.operator_box_div.y+label_yoff);
          ctx.textAlign = "right";
          ctx.fillText("divide", self.operator_box_div.x+self.operator_box_div.w-5, self.operator_box_div.y+label_yoff);

          drawPrevLine(self.operator_box_mul.y+self.operator_box_mul.h+5);

          ctx.strokeStyle = gray;
          if(self.sign_box_pos.on) ctx.fillStyle = green;
          else                     ctx.fillStyle = white;
          fillRBox(self.sign_box_pos,5,ctx);
          strokeRBox(self.sign_box_pos,5,ctx);
          if(self.sign_box_neg.on) ctx.fillStyle = green;
          else                     ctx.fillStyle = white;
          fillRBox(self.sign_box_neg,5,ctx);
          strokeRBox(self.sign_box_neg,5,ctx);
          ctx.fillStyle = black;
          ctx.textAlign = "left";
          ctx.fillText("positive", self.sign_box_pos.x+5, self.sign_box_neg.y+label_yoff);
          ctx.textAlign = "right";
          ctx.fillText("negative", self.sign_box_neg.x+self.sign_box_neg.w-5, self.sign_box_neg.y+label_yoff);

          drawPrevLine(self.sign_box_pos.y+self.sign_box_pos.h+5);
        }

        if(!selected_module.primary)
        {
          ctx.fillStyle = red;
          fillRBox(self.del_btn,5,ctx);
          strokeRBox(self.del_btn,5,ctx);
          ctx.fillStyle = white;
          ctx.fillText("DELETE",self.del_btn.x+44,self.del_btn.y+self.del_btn.h-8);
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
      str += "{\"title\":\""+m.title+"\",\"img_name\":\""+m.img_name+"\",\"color\":\""+m.color+"\",\"type\":"+m.type+",\"v\":"+m.v_default+",\"min\":"+m.min+",\"max\":"+m.max+",\"pool\":"+m.pool+",\"graph\":"+m.graph+",\"wx\":"+m.wx+",\"wy\":"+m.wy+",\"ww\":"+m.ww+",\"wh\":"+m.wh+",\"input\":"+input+",\"output\":"+output+",\"lock_move\":"+m.lock_move+",\"lock_input\":"+m.lock_input+",\"lock_output\":"+m.lock_output+",\"lock_value\":"+m.lock_value+",\"lock_min\":"+m.lock_min+",\"lock_max\":"+m.lock_max+",\"lock_pool\":"+m.lock_pool+",\"lock_graph\":"+m.lock_graph+"}";
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
      m.img_name = tm.img_name;
      if(m.img_name) { m.img = new Image(); m.img.onload = (function(m){return (function(){ m.body_cache = {buffer:10}; })})(m); m.img.src = m.img_name; }
      if(tm.color) m.color = tm.color;
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
    s_graphs.off_y = 0;
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

    var tvecs = [];
    for(var i = 0; i < 10; i++)
      tvecs[i] = {x:0,y:0};
    var base = {x:0,y:0};
    self.shouldDrag = function(evt)
    {
      if((dragging_obj && dragging_obj != self) || !self.srcShouldDrag()) return false;
      if(self.attachment)
      {
        base.x = self.src.x+self.src.w/2+self.off.x;
        base.y = self.src.y+self.src.h/2+self.off.y;
        tvecs[0].x = self.attachment.x+self.attachment.w/2;
        tvecs[0].y = self.attachment.y+self.attachment.h/2;
        subvec(base,tvecs[0],tvecs[1]);
        safenormvec(tvecs[1],1,tvecs[1]);
        mulvec(tvecs[1],self.attachment.w/2,tvecs[1]);
        addvec(tvecs[0],tvecs[1],base);
        if(distsqr(base.x,base.y,evt.doX,evt.doY) < self.r*self.r)
        {
          if(src.type == MODULE_TYPE_MODULE || src.type == MODULE_TYPE_OBJECT) src.swapIntoRelationship();
          return true;
        }
      }
      else
      {
        if(distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.h/2+self.off.y,evt.doX,evt.doY) < self.r*self.r)
        {
          if(src.type == MODULE_TYPE_MODULE || src.type == MODULE_TYPE_OBJECT) src.swapIntoRelationship();
          return true;
        }
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
      self.src.whippet_dragged(evt,self);
      s_editor.center();
    }
    self.drag = function(evt)
    {
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
      self.src.whippet_dragged(evt,self);
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
    self.img_name = "";
    self.img = 0;
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
              !self.lock_output &&
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
    self.whippet_dragged = function(evt,whippet)
    {
      if(whippet == self.output_dongle)
      {
        if(self.input_dongle.attachment)
        {
          var ix = self.input_dongle.attachment.x+self.input_dongle.attachment.w/2;
          var iy = self.input_dongle.attachment.y+self.input_dongle.attachment.h/2;
          var ox = evt.doX;
          var oy = evt.doY;
          if(distsqr(ix,iy,ox,oy) < 1000)
          {
            var v = {x:ox-ix,y:oy-iy};
            safenormvec(v,1,v);
            self.x = lerp(self.x,ix+v.x*80-self.w/2,0.8);
            self.y = lerp(self.y,iy+v.y*80-self.h/2,0.8);
          }
          else
          {
            self.x = lerp(self.x,lerp(self.output_dongle.drag_x,self.input_dongle.attachment.x+self.input_dongle.attachment.w/2,0.5)-self.w/2,0.9);
            self.y = lerp(self.y,lerp(self.output_dongle.drag_y,self.input_dongle.attachment.y+self.input_dongle.attachment.h/2,0.5)-self.h/2,0.9);
          }
          worldSpaceCoords(work_cam,canv,self);
        }
      }
      if(whippet == self.input_dongle)
      {
        if(self.output_dongle.attachment)
        {
          var ix = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
          var iy = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
          var ox = evt.doX;
          var oy = evt.doY;
          if(distsqr(ix,iy,ox,oy) < 1000)
          {
            var v = {x:ox-ix,y:oy-iy};
            safenormvec(v,1,v);
            self.x = lerp(self.x,ix+v.x*80-self.w/2,0.8);
            self.y = lerp(self.y,iy+v.y*80-self.h/2,0.8);
          }
          else
          {
            self.x = lerp(self.x,lerp(self.input_dongle.drag_x,self.output_dongle.attachment.x+self.output_dongle.attachment.w/2,0.5)-self.w/2,0.9);
            self.y = lerp(self.y,lerp(self.input_dongle.drag_y,self.output_dongle.attachment.y+self.output_dongle.attachment.h/2,0.5)-self.h/2,0.9);
          }
          worldSpaceCoords(work_cam,canv,self);
        }
      }
    }

    self.input_dongle = new whippet_dongle( self.w,0,dongle_img.width/4,self,self.shouldShowInputDongle);
    self.output_dongle = new whippet_dongle(-self.w,0,dongle_img.width/4,self,self.shouldShowOutputDongle);

    //the module itself
    self.sticky_drag = 0;
    self.drag_t = 0;
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
      self.drag_t = 0;
    }
    self.drag = function(evt)
    {
      self.x = evt.doX-self.drag_start_x;
      self.y = evt.doY-self.drag_start_y;
      worldSpaceCoords(work_cam,canv,self);
      s_editor.center();
      self.drag_t++;
      if(self.drag_t > 5) self.sticky_drag = 0;
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self)
      {
        if(!self.sticky_drag)
        {
          dragging_obj = 0;
          //if(!self.primary && rectCollide(self.x,self.y,self.w,self.h,remove_module_btn.x,remove_module_btn.y,remove_module_btn.w,remove_module_btn.h))
            //deleteModule(self);
          if(!self.primary && self.title == "") s_editor.title_box.focus();
        }
        else
        {
          setTimeout(function(){self.dragging = true;},1); //hack keep it dragging
          self.sticky_drag = 0;
        }
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

    self.known_hover_x = 0;
    self.known_hover_y = 0;
    self.hover   = function(evt){ self.known_hover_x = evt.doX; self.known_hover_y = evt.doY; }
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
            if(self.img_name && self.img && self.img.complete)
            {
              self.body_cache.module_const.context.globalCompositeOperation = "source-atop";
              self.body_cache.module_const.context.drawImage(self.img,0,0,self.body_cache.module_const.width,self.body_cache.module_const.height);
              self.body_cache.module_const.context.globalCompositeOperation = "source-over";
              self.body_cache.module_const.context.globalAlpha = 0.1;
              fillR(self.body_cache.buffer,self.body_cache.buffer,self.w,self.h,10,self.body_cache.module_const.context);
              self.body_cache.module_const.context.globalAlpha = 1;
            }
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
              if(self.img_name && self.img && self.img.complete)
              {
                self.body_cache.module_nconst_pool.context.globalCompositeOperation = "source-atop";
                self.body_cache.module_nconst_pool.context.drawImage(self.img,0,0,self.body_cache.module_nconst_pool.width,self.body_cache.module_nconst_pool.height);
                self.body_cache.module_nconst_pool.context.globalCompositeOperation = "source-over";
                self.body_cache.module_nconst_pool.context.globalAlpha = 0.1;
                self.body_cache.module_nconst_pool.context.fill();
                self.body_cache.module_nconst_pool.context.globalAlpha = 1;
              }
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
              if(self.img_name && self.img && self.img.complete)
              {
                self.body_cache.module_nconst_npool.context.globalCompositeOperation = "source-atop";
                self.body_cache.module_nconst_npool.context.drawImage(self.img,0,0,self.body_cache.module_nconst_npool.width,self.body_cache.module_nconst_npool.height);
                self.body_cache.module_nconst_npool.context.globalCompositeOperation = "source-over";
                self.body_cache.module_nconst_npool.context.globalAlpha = 0.1;
                self.body_cache.module_nconst_npool.context.fill();
                self.body_cache.module_nconst_npool.context.globalAlpha = 1;
              }
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
          if(true || self.v != 1)
          {
            if(!self.body_cache.rel_const)
            {
              self.body_cache.rel_const = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
              self.body_cache.rel_const.context.fillStyle = bg_color;
              self.body_cache.rel_const.context.strokeStyle = line_color;
              fillR(self.body_cache.buffer+self.w/7,self.body_cache.buffer+self.h/3,self.w*5/7,self.h/3,5,self.body_cache.rel_const.context);
              if(self.img_name && self.img && self.img.complete)
              {
                self.body_cache.module_rel_const.context.globalCompositeOperation = "source-atop";
                self.body_cache.module_rel_const.context.drawImage(self.img,0,0,self.body_cache.module_rel_const.width,self.body_cache.module_rel_const.height);
                self.body_cache.module_rel_const.context.globalCompositeOperation = "source-over";
                self.body_cache.module_rel_const.context.globalAlpha = 0.1;
                fillR(self.body_cache.buffer+self.w/7,self.body_cache.buffer+self.h/3,self.w*5/7,self.h/3,5,self.body_cache.rel_const.context);
                self.body_cache.module_rel_const.context.globalAlpha = 1;
              }
              strokeR(self.body_cache.buffer+self.w/7,self.body_cache.buffer+self.h/3,self.w*5/7,self.h/3,5,self.body_cache.rel_const.context);
            }
            ctx.drawImage(self.body_cache.rel_const,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
          }
        }
        else
        {
          var b = 10;
          if(!self.body_cache.rel_nconst)
          {
            self.body_cache.rel_nconst = GenIcon(self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);
            self.body_cache.rel_nconst.context.fillStyle = bg_color;
            self.body_cache.rel_nconst.context.strokeStyle = line_color;
            self.body_cache.rel_nconst.context.drawImage(hex_bg_img,self.body_cache.buffer+b,self.body_cache.buffer+b,self.w-b*2,self.h-b*2);
            if(self.img_name && self.img && self.img.complete)
            {
              self.body_cache.module_rel_nconst.context.globalCompositeOperation = "source-atop";
              self.body_cache.module_rel_nconst.context.drawImage(self.img,0,0,self.body_cache.module_rel_nconst.width,self.body_cache.module_rel_nconst.height);
              self.body_cache.module_rel_nconst.context.globalCompositeOperation = "source-over";
              self.body_cache.module_rel_nconst.context.globalAlpha = 0.1;
              self.body_cache.rel_nconst.context.drawImage(hex_bg_img,self.body_cache.buffer+b,self.body_cache.buffer+b,self.w-b*2,self.h-b*2);
              self.body_cache.module_rel_nconst.context.globalAlpha = 1;
            }
          }
          ctx.drawImage(self.body_cache.rel_nconst,self.x-self.body_cache.buffer,self.y-self.body_cache.buffer,self.w+self.body_cache.buffer*2,self.h+self.body_cache.buffer*2);

          //body
          var s = self.w-b*2;
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
            var s = self.w-b*2-3;
            ymin = self.y+self.h/2-s/2+(s*(1-p));
            ymax = self.y+self.h/2-s/2+(s*(1-zp));
            img = hex_fill_img;
          }
          else if(zp > p)
          {
            var s = self.w-b*2-3;
            ymin = self.y+self.h/2-s/2+(s*(1-zp));
            ymax = self.y+self.h/2-s/2+(s*(1-p));
            img = hex_neg_fill_img;
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
            ctx.drawImage(img,self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
            ctx.restore();
          }

        }
      }

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
        if(self.input_dongle.attachment)
        {
          tvecs[0].x = self.input_dongle.attachment.x+self.input_dongle.attachment.w/2;
          tvecs[0].y = self.input_dongle.attachment.y+self.input_dongle.attachment.h/2;
          subvec(base,tvecs[0],tvecs[1]);
          safenormvec(tvecs[1],1,tvecs[1]);
          mulvec(tvecs[1],self.input_dongle.attachment.w/2,tvecs[1]);
          addvec(tvecs[0],tvecs[1],base);
          from.x = -tvecs[1].x;
          from.y = -tvecs[1].y;
        }
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
        if(self.input_dongle.attachment)
        {
          tvecs[0].x = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
          tvecs[0].y = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
          subvec(base,tvecs[0],tvecs[1]);
          safenormvec(tvecs[1],1,tvecs[1]);
          mulvec(tvecs[1],self.output_dongle.attachment.w/2,tvecs[1]);
          addvec(tvecs[0],tvecs[1],base);
          from.x = -tvecs[1].x;
          from.y = -tvecs[1].y;
        }
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
        if(true || self.v != 1 || !self.cache_const)
        {
          ctx.font = "10px Roboto Mono";
          if(self.v < 0)
          ctx.fillText("x("+fdisp(self.v,2)+")",self.x+self.w/2,self.y+self.h/2+5);
          else
          ctx.fillText("x"+fdisp(self.v,2),self.x+self.w/2,self.y+self.h/2+5);
        }
      }

    }

    var tvecs = [];
    for(var i = 0; i < 10; i++)
      tvecs[i] = {x:0,y:0};
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
          if(
            self.shouldShowOutputDongle()
          )
          {
            self.output_dongle.off.x = self.known_hover_x-(self.x+self.w/2);
            self.output_dongle.off.y = self.known_hover_y-(self.y+self.h/2);
            safenormvec(self.output_dongle.off,1,self.output_dongle.off);
            mulvec(self.output_dongle.off,20,self.output_dongle.off);
          }
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

  var readied = false;
  self.ready = function()
  {
    if(readied)
    {
      clicker.flush();
      dragger.flush();
      hoverer.flush();
      keyer.flush();
      blurer.flush();
      return;
    }
    readied = true;
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});
    hoverer = new PersistentHoverer({source:stage.dispCanv.canvas});
    keyer   = new Keyer(  {source:stage.dispCanv.canvas});
    blurer  = new Blurer( {source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};

    modules = [];
    selected_module = 0;
    dragging_obj = 0;
    full_pause = false;
    drag_pause = false;
    advance_timer_max = 10;
    advance_timer = advance_timer_max;
    t_i = 0;
    t_max = 10;
    n_ticks = 0;

    load_template_i = 0;
    templates = [];
    /*empty*/            templates.push("{\"modules\":[]}");
    /*feedback loop*/    templates.push("{\"modules\":[{\"title\":\"microphone\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":-0.478125,\"wy\":0.16874999999999993,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"amp\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.27812499999999996,\"wy\":0.15937500000000004,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"makes sound\",\"type\":2,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.08125000000000004,\"wy\":0.40312499999999996,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0},{\"title\":\"records sound\",\"type\":2,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.12187499999999996,\"wy\":-0.05312500000000002,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1}]}");
    /*normalizing loop*/ templates.push("{\"modules\":[{\"title\":\"bowl\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.275,\"wy\":0.046875,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"kids\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.5125,\"wy\":0.09687499999999999,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"teachers\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.7562500000000002,\"wy\":0.36875,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"each take jellybeans\",\"type\":2,\"v\":-1,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.034374999999999864,\"wy\":0.25625,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0},{\"title\":\"each put jellybeans into\",\"type\":2,\"v\":1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.74375,\"wy\":0.10625000000000007,\"ww\":0.1136,\"wh\":0.1136,\"input\":2,\"output\":0},{\"title\":\"attracts kids\",\"type\":2,\"v\":0.9,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":0.09062499999999989,\"wy\":-0.12500000000000006,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1}]}");
    /*cycle*/            templates.push("{\"modules\":[{\"title\":\"rabbits\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.21562499999999996,\"wy\":0.2,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"eat\",\"type\":2,\"v\":-0.3,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.034375000000000044,\"wy\":0.4,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0},{\"title\":\"nourish\",\"type\":2,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1},{\"title\":\"breed\",\"type\":2,\"v\":10,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.6625,\"wy\":0.21874999999999994,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":0},{\"title\":\"die\",\"type\":2,\"v\":-10,\"min\":-10,\"max\":10,\"pool\":true,\"graph\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":1}]}");
    /*proportion cycle*/ templates.push("{\"modules\":[{\"title\":\"rabits\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"eat\",\"type\":2,\"v\":-0.4,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.009375000000000022,\"wy\":0.384375,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":0},{\"title\":\"nourish\",\"type\":2,\"v\":0.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1},{\"title\":\"breed\",\"type\":2,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.665625,\"wy\":0.19999999999999996,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":0},{\"title\":\"die\",\"type\":2,\"v\":-0.2,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.5,\"wy\":0.15,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":1}]}");
    /*circle of life*/   templates.push("{\"modules\":[{\"title\":\"sun\",\"img_name\":\"assets/sun.png\",\"color\":\"#FFF46F\",\"type\":1,\"v\":10,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.4125,\"wy\":0.1062499999999999,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"grass\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.81875,\"wy\":0.078125,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"gives light\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.1204999999999998,\"wy\":0.09262500000000004,\"ww\":0.1136,\"wh\":0.1136,\"input\":0,\"output\":1},{\"title\":\"herbivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.21425000000000005,\"wy\":0.08325000000000002,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"nourishes\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.492375,\"wy\":0.20825,\"ww\":0.1136,\"wh\":0.1136,\"input\":1,\"output\":3},{\"title\":\"eats\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.49550000000000005,\"wy\":-0.03862499999999991,\"ww\":0.1136,\"wh\":0.1136,\"input\":3,\"output\":1},{\"title\":\"carnivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.3224999999999999,\"wy\":0.06737500000000013,\"ww\":0.1136,\"wh\":0.1136,\"input\":-1,\"output\":-1},{\"title\":\"nourishes\",\"type\":2,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.044375000000000164,\"wy\":0.2017500000000001,\"ww\":0.1136,\"wh\":0.1136,\"input\":3,\"output\":6},{\"title\":\"eats\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.038125000000000075,\"wy\":-0.05762499999999995,\"ww\":0.1136,\"wh\":0.1136,\"input\":6,\"output\":3},{\"title\":\"\",\"type\":2,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.6540000000000006,\"wy\":0.07125000000000006,\"ww\":0.1136,\"wh\":0.1136,\"input\":6,\"output\":6}]}");

    s_dragger = new screen_dragger();
    s_graphs = new graphs();
    s_graphs.x = 0;
    s_graphs.y = 50;
    s_graphs.w = 300;
    s_graphs.h = canv.height-s_graphs.y-50;
    s_graphs.calc_sub_params();
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

    modal = {};
    modal.w = 400;
    modal.h = 300;
    modal.x = canv.width/2-modal.w/2;
    modal.y = canv.height/2-modal.h/2;
    modal.click = function(evt)
    {
      game_state = GAME_STATE_PLAY;
    }
    modal.draw = function()
    {
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0,0,canv.width,canv.height);
      ctx.strokeStyle = line_color;
      ctx.lineWidth = 4;
      strokeR(modal.x,modal.y,modal.w,modal.h,10,ctx);
      ctx.fillStyle = bg_color;
      fillR(modal.x,modal.y,modal.w,modal.h,10,ctx);
      ctx.fillStyle = white;
      ctx.font = "18px Roboto Mono";
      ctx.fillText("This model is a good match",modal.x+30,modal.y+150);
      ctx.fillText("for our data!",modal.x+30,modal.y+190);
      ctx.fillText("Continue",modal.x+modal.w/2-40,modal.y+270);
      ctx.drawImage(win_img,modal.x+modal.w/2-80,modal.y-80,160,180);
    }

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

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; m.sticky_drag = 1; }
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
    remove_module_btn.x = add_module_btn.x+add_module_btn.w+20;
    remove_module_btn.y = canv.height-remove_module_btn.h-10;

    menu_btn = new btn();
    menu_btn.h = 30;
    menu_btn.w = menu_btn_img.width*(menu_btn.h/menu_btn_img.height);
    menu_btn.x = 10;
    menu_btn.y = 10;
    menu_btn.click = function(evt)
    {
      game_state = GAME_STATE_MENU;
      if(blurb.g_viz == 1) blurb.g_viz = 0;
    }

    next_level_btn = new btn();
    next_level_btn.h = 30;
    next_level_btn.w = next_level_btn_img.width*(next_level_btn.h/next_level_btn_img.height);
    next_level_btn.x = canv.width-next_level_btn.w-10;
    next_level_btn.y = 10;
    next_level_btn.click = function(evt)
    {
      if(levelComplete()) //nextLevel();
      {
        if(levels[cur_level_i]) levels[cur_level_i].complete = true;
        game_state = GAME_STATE_MENU;

        var url = location.href;
        var p_i = url.indexOf("?");
        if(p_i != -1) url = url.substr(0,p_i);
        url = url + "?code=" + genCode();
        window.history.replaceState({},"Modelling Game",url);

        if(blurb.g_viz == 1) blurb.g_viz = 0;
      }
    }

    clear_btn = new btn();
    clear_btn.h = 30;
    clear_btn.w = clear_btn_img.width*(clear_btn.h/clear_btn_img.height);
    clear_btn.x = menu_btn.x+menu_btn.w+10;
    clear_btn.y = 10;
    clear_btn.click = function(evt)
    {
      beginLevel();
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

    var j = jsonFromURL();
    if(j && j.code) consumeCode(j.code);
  };

  var resetGraph = function()
  {
    for(var j = 0; j < 2 || (predict && j < t_max); j++)
    {
      t_i = 0;
      advance_timer = advance_timer_max;
      for(var i = 0; i < modules.length; i++)
      {
        modules[i].cache_graph = 0;
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
    if(game_state == GAME_STATE_PLAY || game_state == GAME_STATE_MODAL)
    {
      var clicked = false;
      if(clicker.filter(blurb))                  clicked = true;
      if(game_state == GAME_STATE_PLAY)
      {
        if(!clicked && selected_module && s_editor.filter())   clicked = true;
        if(!clicked && dragger.filter(s_ctrls.speed_slider))   clicked = true;
        if(!clicked && clicker.filter(s_ctrls.pause_btn))      clicked = true;
        if(!clicked && clicker.filter(s_ctrls.advance_btn))    clicked = true;
        if(!clicked && clicker.filter(s_ctrls.reset_btn))      clicked = true;
        if(!clicked && clicker.filter(s_ctrls.speed_slow_btn)) clicked = true;
        if(!clicked && clicker.filter(s_ctrls.speed_med_btn))  clicked = true;
        if(!clicked && clicker.filter(s_ctrls.speed_fast_btn)) clicked = true;
        if(!clicked && clicker.filter(next_level_btn))         clicked = true;
        if(!clicked && clicker.filter(clear_btn))              clicked = true;
        if(!clicked && clicker.filter(menu_btn))               clicked = true;
        if(!clicked && clicker.filter(print_btn))              clicked = true;
        if(!clicked && clicker.filter(load_btn))               clicked = true;
        if(!clicked && dragger.filter(s_graphs))               clicked = true;
        clicker.filter(levels[cur_level_i]);
        if(!clicked)
        {
          for(var i = 0; i < modules.length; i++) if(!modules[i].lock_input)                                                 if(dragger.filter(modules[i].input_dongle)) clicked = true;
          for(var i = 0; i < modules.length; i++) if(!modules[i].lock_output && modules[i].type == MODULE_TYPE_RELATIONSHIP) if(dragger.filter(modules[i].output_dongle)) clicked = true;
          for(var i = 0; i < modules.length; i++) if(!modules[i].lock_output && modules[i].type != MODULE_TYPE_RELATIONSHIP) if(dragger.filter(modules[i].output_dongle)) clicked = true;
          for(var i = 0; i < modules.length; i++)
          {
            hoverer.filter(modules[i]);
            if(!modules[i].lock_move) if(dragger.filter(modules[i])) clicked = true;
          }
        }
        if(!clicked && dragger.filter(add_module_btn)) clicked = true;
        if(!clicked) dragger.filter(s_dragger);
      }
      else if(game_state == GAME_STATE_MODAL)
      {
        clicker.filter(modal);
      }

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
        {
          flow();
          if(
            !levels[cur_level_i].finished &&
            levels[cur_level_i].primary_module_target_vals[0] &&
            t_i >= levels[cur_level_i].primary_module_target_vals[0].length-1 &&
            levelComplete()
          )
          {
            if(!levels[cur_level_i].complete) ga('send', 'event', 'model_level', 'complete', cur_level_i, 1);
            levels[cur_level_i].complete = true;
            levels[cur_level_i].finished = true;
            game_state = GAME_STATE_MODAL;
          }
          for(var i = 0; i < modules.length; i++)
            modules[i].cache_graph = 0;
        }
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

    if(game_state == GAME_STATE_PLAY || game_state == GAME_STATE_MODAL)
    {
      calc_caches();

      ctx.lineWidth = 1;
      ctx.textAlign = "left";
      if(!levels[cur_level_i] || levels[cur_level_i].add_module_enabled)
        imageBox(add_btn_img,add_module_btn,ctx);
      //if(dragging_obj && !dragging_obj.primary && dragging_obj != s_dragger && dragging_obj != s_editor && !dragging_obj.src) //src implies whippet
        //imageBox(remove_btn_img,remove_module_btn,ctx);

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

      ctx.fillStyle = bgbg_color;
      ctx.fillRect(0,0,canv.width,menu_btn.y+menu_btn.h+10);

      s_graphs.draw();
      s_ctrls.draw();

      ctx.fillStyle = black;
      ctx.strokeStyle = black;
      ctx.lineWidth = 1;
      ctx.textAlign = "left";
      ctx.fillStyle = "#AAAAAA";
      if(levelComplete()) imageBox(next_level_btn_img,next_level_btn,ctx);
      imageBox(clear_btn_img,clear_btn,ctx);
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
    if(game_state == GAME_STATE_MENU)
    {
      ctx.fillStyle = white;
      ctx.font = "20px Roboto Mono";
      ctx.fillText("Computational Modeling",20,50);
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
    if(game_state == GAME_STATE_MODAL)
    {
      modal.draw();
    }

/*
    for(var i = 0; i < good_colors.length; i++)
    {
      ctx.fillStyle = good_colors[i];
      ctx.fillRect(10+(60*i),10,50,50);
    }
*/
  };

  self.cleanup = function()
  {
  };

};

