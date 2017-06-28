var GamePlayScene = function(game, stage)
{
  var self = this;

  var green = "#00AA00";
  var red = "#AA0000";
  var white = "#FFFFFF";
  var black = "#000000";
  var brown = "#755232";

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

  var add_object_btn;
  var add_object_btn;
  var remove_module_btn;
  var next_level_btn;
  var print_btn;
  var load_btn;
  var load_template_i;
  var templates;

  var s_dragger;
  var s_graph;
  var s_editor;
  var speed_slider;

  var w;
  var h;

  var module_outline_s = 60;
  var module_s = 50;
  var module_fill_s = 45;
  var module_inner_s = 30;

  var good_colors = [];
  good_colors.push("#ED6857");
  good_colors.push("#EEBC39");
  good_colors.push("#F28693");
  good_colors.push("#009DA6");
  good_colors.push("#9E9E9E");
  good_colors.push("#FBAB33");
  good_colors.push("#671318");
  good_colors.push("#008362");
  good_colors.push("#512EAF");

  w = 20;
  h = 20;
  var dongle_img = GenIcon(w,h)
  dongle_img.context.fillStyle = "#EEEEEE";
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

  var precision = 2;
  var predict = false;

  var level = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = canv.width;
    self.h = canv.height;
    self.primary_module_template = "";
    self.primary_module_target_vals = [];
    self.ready = noop;
    self.tick = noop;
    self.draw = noop;
    self.add_object_enabled = true;
    self.add_relationship_enabled = true;
    self.add_module_enabled = true;
    self.remove_enabled = true;
    self.save_enabled = false;
    self.load_enabled = false;
    self.play_enabled = true;
    self.speed_enabled = true;
    self.dismissed = 0;
    self.click = function(){ self.dismissed++; };
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
    var targets = levels[cur_level_i].primary_module_target_vals;
    if(targets && targets.length)
    {
      for(var i = 0; i < targets[0].length; i++) //inverted loop
        for(var j = 0; j < targets.length; j++)
          if(t_i < i || modules[j].plot[i] != targets[j][i]) return false
    }
    else return false
    return true;
  }

  var nextLevel = function()
  {
    cur_level_i++;
    if(cur_level_i >= levels.length) cur_level_i = 0;
    levels[cur_level_i].gen_modules();
    levels[cur_level_i].ready();
    resetGraph();
    full_pause = true;
  }

  var levels = [];
  var cur_level_i = -1; //call nextLevel once!
  var l;

  l = new level();
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":1,\"v\":1,\"min\":0,\"max\":40,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"Growth Rate (M/T)\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0}]}";
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_object_enabled = false;
  l.add_relationship_enabled = false;
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    modules[0].lock_input = true;
    modules[0].lock_output = true;
    modules[0].lock_value = true;
    modules[0].lock_min = true;
    modules[0].lock_max = true;
    modules[0].lock_pool = true;
    modules[0].lock_graph = true;

    modules[1].lock_input = true;
    modules[1].lock_output = true;
    modules[1].lock_value = true;
    modules[1].lock_min = true;
    modules[1].lock_max = true;
    modules[1].lock_pool = true;

    selected_module = undefined;//modules[0];
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals[0];
    var minx = 80;
    var maxx = 280;
    var y = 100;
    var x;
    var advance_timer_t = (1-(advance_timer/advance_timer_max));
    var growth_timer_p = t_i+advance_timer_t
    var growth_timer_max = targets.length;
    var growth_timer_t = growth_timer_p/growth_timer_max;
    for(var i = 0; i < targets.length; i++)
    {
      x = lerp(minx,maxx,i/targets.length)-(maxx-minx)*growth_timer_t;
      ctx.globalAlpha = 0.2;
      draw_tree(x,y,i,0,targets);
      ctx.globalAlpha = 1;
      if(t_i >= i)
      {
        if(modules[0].plot[i] == targets[i])
        {
          ctx.fillStyle = green;
          ctx.fillText("✔",x,y+20);
        }
        else
        {
          ctx.fillStyle = red;
          ctx.fillText("✘",x,y+20);
        }
      }
    }
    draw_tree(minx,y,t_i,advance_timer_t,modules[0].plot);

    if(advance_timer == advance_timer_max && t_i < 4)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("Click Advance",70,280);
      ctx.font = "12px Arial";
    }
    if(t_i >= 4)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("Simulation Complete!",380,140);
      ctx.fillText("Click Next Level",380,160);
      ctx.font = "12px Arial";
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, s_graph.advance_btn)) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":1,\"v\":1,\"min\":0,\"max\":40,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"Growth Rate (M/T)\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0}]}";
  l.primary_module_target_vals.push([2,3,4,5,6]);
  l.add_object_enabled = false;
  l.add_relationship_enabled = false;
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    modules[0].lock_input = true;
    modules[0].lock_output = true;
    modules[0].lock_min = true;
    modules[0].lock_max = true;
    modules[0].lock_pool = true;
    modules[0].lock_graph = true;

    modules[1].lock_input = true;
    modules[1].lock_output = true;
    modules[1].lock_value = true;
    modules[1].lock_min = true;
    modules[1].lock_max = true;
    modules[1].lock_pool = true;

    selected_module = undefined;//modules[0];
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals[0];
    var minx = 80;
    var maxx = 280;
    var y = 100;
    var x;
    var advance_timer_t = (1-(advance_timer/advance_timer_max));
    var growth_timer_p = t_i+advance_timer_t
    var growth_timer_max = targets.length;
    var growth_timer_t = growth_timer_p/growth_timer_max;
    for(var i = 0; i < targets.length; i++)
    {
      x = lerp(minx,maxx,i/targets.length)-(maxx-minx)*growth_timer_t;
      ctx.globalAlpha = 0.2;
      draw_tree(x,y,i,0,targets);
      ctx.globalAlpha = 1;
      if(t_i >= i)
      {
        if(modules[0].plot[i] == targets[i])
        {
          ctx.fillStyle = green;
          ctx.fillText("✔",x,y+20);
        }
        else
        {
          ctx.fillStyle = red;
          ctx.fillText("✘",x,y+20);
        }
      }
    }
    draw_tree(minx,y,t_i,advance_timer_t,modules[0].plot);

    var targets = levels[cur_level_i].primary_module_target_vals;
    if(modules[0].plot[0] != targets[0][0])
    {
      ctx.textAlign = "left";
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("This doesn't conform",450,40);
      ctx.fillText("to our data...",450,60);
      ctx.textAlign = "center";
      ctx.fillText("Select the Tree Height module",340,150);
      ctx.fillText("And set its starting value",340,170);
      ctx.font = "12px Arial";
    }
    if(levelComplete() && t_i >= 4)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("Simulation Complete!",380,140);
      ctx.fillText("Click Next Level",380,160);
      ctx.font = "12px Arial";
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, modules[1])) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":1,\"v\":1,\"min\":0,\"max\":40,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"Growth Rate (M/T)\",\"type\":2,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":0,\"wx\":-0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0}]}";
  l.primary_module_target_vals.push([1,3,5,7,9]);
  l.add_object_enabled = false;
  l.add_relationship_enabled = false;
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    modules[0].lock_input = true;
    modules[0].lock_output = true;
    modules[0].lock_value = true;
    modules[0].lock_min = true;
    modules[0].lock_max = true;
    modules[0].lock_pool = true;
    modules[0].lock_graph = true;

    modules[1].lock_input = true;
    modules[1].lock_output = true;
    modules[1].lock_min = true;
    modules[1].lock_max = true;
    modules[1].lock_pool = true;

    selected_module = undefined;//modules[0];
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals[0];
    var minx = 80;
    var maxx = 280;
    var y = 100;
    var x;
    var advance_timer_t = (1-(advance_timer/advance_timer_max));
    var growth_timer_p = t_i+advance_timer_t
    var growth_timer_max = targets.length;
    var growth_timer_t = growth_timer_p/growth_timer_max;
    for(var i = 0; i < targets.length; i++)
    {
      x = lerp(minx,maxx,i/targets.length)-(maxx-minx)*growth_timer_t;
      ctx.globalAlpha = 0.2;
      draw_tree(x,y,i,0,targets);
      ctx.globalAlpha = 1;
      if(t_i >= i)
      {
        if(modules[0].plot[i] == targets[i])
        {
          ctx.fillStyle = green;
          ctx.fillText("✔",x,y+20);
        }
        else
        {
          ctx.fillStyle = red;
          ctx.fillText("✘",x,y+20);
        }
      }
    }
    draw_tree(minx,y,t_i,advance_timer_t,modules[0].plot);

    var targets = levels[cur_level_i].primary_module_target_vals;
    if(t_i > 0 && modules[0].plot[1] != targets[0][1])
    {
      ctx.textAlign = "left";
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("This doesn't conform",450,40);
      ctx.fillText("to our data...",450,60);
      ctx.textAlign = "center";
      ctx.fillText("Select the Growth Rate module",340,150);
      ctx.fillText("And set its contribution",340,170);
      ctx.font = "12px Arial";
    }
    if(levelComplete() && t_i >= 4)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("Simulation Complete!",380,140);
      ctx.fillText("Click Next Level",380,160);
      ctx.font = "12px Arial";
    }
  }
  l.click = function(evt)
  {
    if(doEvtWithinBB(evt, modules[1])) levels[cur_level_i].dismissed++;
  }
  levels.push(l);

  l = new level();
  l.primary_module_template = "{\"modules\":[{\"title\":\"Tree Height (M)\",\"type\":1,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":1,\"wx\":0.2,\"wy\":-0.08,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1}]}";
  l.primary_module_target_vals.push([1,2,3,4,5]);
  l.add_object_enabled = false;
  l.add_module_enabled = false;
  l.remove_enabled = false;
  l.play_enabled = false;
  l.speed_enabled = false;
  l.ready = function()
  {
    modules[0].lock_input = true;
    modules[0].lock_output = true;
    modules[0].lock_value = true;
    modules[0].lock_min = true;
    modules[0].lock_max = true;
    modules[0].lock_pool = true;
    modules[0].lock_graph = true;

    selected_module = undefined;//modules[0];
  }
  l.draw = function()
  {
    var targets = levels[cur_level_i].primary_module_target_vals[0];
    var minx = 80;
    var maxx = 280;
    var y = 100;
    var x;
    var advance_timer_t = (1-(advance_timer/advance_timer_max));
    var growth_timer_p = t_i+advance_timer_t
    var growth_timer_max = targets.length;
    var growth_timer_t = growth_timer_p/growth_timer_max;
    for(var i = 0; i < targets.length; i++)
    {
      x = lerp(minx,maxx,i/targets.length)-(maxx-minx)*growth_timer_t;
      ctx.globalAlpha = 0.2;
      draw_tree(x,y,i,0,targets);
      ctx.globalAlpha = 1;
      if(t_i >= i)
      {
        if(modules[0].plot[i] == targets[i])
        {
          ctx.fillStyle = green;
          ctx.fillText("✔",x,y+20);
        }
        else
        {
          ctx.fillStyle = red;
          ctx.fillText("✘",x,y+20);
        }
      }
    }
    draw_tree(minx,y,t_i,advance_timer_t,modules[0].plot);

    var targets = levels[cur_level_i].primary_module_target_vals;
    if(t_i > 0 && modules[0].plot[1] != targets[0][1])
    {
      ctx.textAlign = "left";
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("This doesn't conform",450,40);
      ctx.fillText("to our data...",450,60);
      ctx.textAlign = "center";
      ctx.fillText("Drag out an action module",340,150);
      ctx.fillText("And set its output to Tree Height",340,170);
      ctx.font = "12px Arial";
    }
    if(levelComplete() && t_i >= 4)
    {
      ctx.font = "20px Arial";
      ctx.fillStyle = black;
      ctx.fillText("Simulation Complete!",380,140);
      ctx.fillText("Click Next Level",380,160);
      ctx.font = "12px Arial";
    }
  }
  levels.push(l);

  var draw_tree = function(x,y,tick,t,plot)
  {
    ctx.strokeStyle = brown;
    ctx.lineWidth = 3;
    var ini_from_x = x;
    var ini_from_y = y;
    var len = function(i){return (plot[i]*5); };

    var from_x = ini_from_x;
    var from_y = ini_from_y;
    var to_x = ini_from_x;
    var to_y;
    if(!isNaN(len(tick+1)))
      to_y = ini_from_y-lerp(len(tick),len(tick+1),t);
    else
      to_y = ini_from_y-len(tick);

    var next_from_x = from_x;
    var next_from_y = from_y;
    var next_to_x = to_x;
    var next_to_y = to_y;

    var frame_t;
    ctx.beginPath();
    ctx.moveTo(from_x,from_y);
    ctx.lineTo(to_x,to_y);
    for(var i = 1; i < plot.length; i++)
    {
      next_from_x = ini_from_x;
      next_from_y = ini_from_y-lerp(len(i-1),len(i),0.5);
      next_to_y =   next_from_y-10;
      if(i%2) next_to_x = next_from_x+len(i)*pow(0.9,i*2)*2;
      else    next_to_x = next_from_x-len(i)*pow(0.9,i*2)*2;

      from_x = ini_from_x;
      from_y = ini_from_y-len(tick-1);
      to_x = ini_from_x;
      to_y = ini_from_y-len(tick);

      if(i < tick) frame_t = 1;
      else if (i == tick) frame_t = t;
      else frame_t = 0;

      from_x = lerp(from_x, next_from_x, frame_t);
      from_y = lerp(from_y, next_from_y, frame_t);
      to_x = lerp(to_x, next_to_x, frame_t);
      to_y = lerp(to_y, next_to_y, frame_t);

      ctx.moveTo(from_x,from_y);
      ctx.lineTo(to_x,to_y);
    }
    ctx.stroke();
    ctx.strokeStyle = black;
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

    var playback_btn_size = 20;
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
      if(!dragging_obj && advance_timer == advance_timer_max && t_i < t_max-1) advance_timer--;
    }

    self.reset_btn = new btn();
    self.reset_btn.click = function(evt)
    {
      if(!dragging_obj) resetGraph();
    }

    self.calc_sub_params = function()
    {
      self.pause_btn.w = playback_btn_size;
      self.pause_btn.h = playback_btn_size;
      self.pause_btn.x = self.x + (playback_btn_size + 10)*0;
      self.pause_btn.y = self.y - playback_btn_size;

      self.advance_btn.w = playback_btn_size;
      self.advance_btn.h = playback_btn_size;
      self.advance_btn.x = self.x + (playback_btn_size + 10)*1;
      self.advance_btn.y = self.y - playback_btn_size;

      self.reset_btn.w = playback_btn_size;
      self.reset_btn.h = playback_btn_size;
      self.reset_btn.x = self.x + (playback_btn_size + 10)*2;
      self.reset_btn.y = self.y - playback_btn_size;

      self.graph_x = self.x+10;
      self.graph_y = self.y+10;
      self.graph_w = self.w-20;
      self.graph_h = self.h-20;
    }

    self.draw = function()
    {
      ctx.lineWidth = 1;
      var x = 0;
      var y = 0;

      for(var i = 0; i < modules.length; i++)
      {
        if(!modules[i].graph) continue;
        ctx.strokeStyle = modules[i].color;
        x = self.graph_x;
        y = self.graph_y+self.graph_h;
        ctx.beginPath();
        if(!isNaN(modules[i].plot[0])) y = self.graph_y+self.graph_h - clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[0]))*self.graph_h;
        ctx.moveTo(x,y);
        for(var j = 0; j <= t_i || (predict && j < t_max); j++)
        {
          x = self.graph_x + (j/(t_max-1)) * self.graph_w;
          if(!isNaN(modules[i].plot[j])) y = self.graph_y+self.graph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[j]))*self.graph_h);
          ctx.lineTo(x,y);
          if(j == t_i)
          {
            if(!isNaN(modules[i].prev_plot)) y = self.graph_y+self.graph_h - (clamp(0,1,mapVal(modules[i].min,modules[i].max,0,1,modules[i].prev_plot))*self.graph_h);
            ctx.lineTo(x,y);
          }
        }
        ctx.stroke();
      }

      ctx.strokeStyle = "#AAAAAA";
      x = self.graph_x+ ((t_i+(1-(advance_timer/advance_timer_max)))/(t_max-1)) * self.graph_w;
      ctx.beginPath();
      ctx.moveTo(x,self.graph_y);
      ctx.lineTo(x,self.graph_y+self.graph_h);
      ctx.stroke();

      ctx.strokeStyle = black;
      ctx.fillStyle = black;

      x = self.graph_x+ (t_i/(t_max-1)) * self.graph_w;
      ctx.beginPath();
      ctx.moveTo(x,self.graph_y);
      ctx.lineTo(x,self.graph_y+self.graph_h);
      ctx.stroke();

      ctx.strokeRect(self.x,self.y,self.w,self.h);
      ctx.strokeRect(self.graph_x,self.graph_y,self.graph_w,self.graph_h);

      ctx.lineWidth = 1;
      if(levels[cur_level_i].play_enabled)
      {
        if(full_pause) ctx.fillText("||",self.pause_btn.x+10,self.pause_btn.y+10);
        else           ctx.fillText(">",self.pause_btn.x+10,self.pause_btn.y+10);
        ctx.strokeRect(self.pause_btn.x,self.pause_btn.y,self.pause_btn.w,self.pause_btn.h);
      }
      if(full_pause)
      {
        ctx.fillText("->",self.advance_btn.x+10,self.advance_btn.y+10);
        ctx.strokeRect(self.advance_btn.x,self.advance_btn.y,self.advance_btn.w,self.advance_btn.h);
      }
      ctx.fillText("<-",self.reset_btn.x+10,self.reset_btn.y+10);
      ctx.strokeRect(self.reset_btn.x,self.reset_btn.y,self.reset_btn.w,self.reset_btn.h);
    }
  }

  var module_editor = function()
  {
    var self = this;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.title_box = new TextBox(0,0,0,0,"",   function(v){ if(selected_module.primary) return; var new_v = v; var old_v = selected_module.title; selected_module.title = new_v; });
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
      var h = 20;
      var w = 20;
      var s = 10;
      var i = 0;

      self.title_box.w = w;
      self.title_box.h = h;
      self.title_box.x = self.x + s;
      self.title_box.y = self.y + s + (h+s)*i;
      i++;

      self.v_box.w = w;
      self.v_box.h = h;
      self.v_box.x = self.x + s;
      self.v_box.y = self.y + s + (h+s)*i;
      i++;

      self.min_box.w = w;
      self.min_box.h = h;
      self.min_box.x = self.x + s;
      self.min_box.y = self.y + s + (h+s)*i;
      i++;

      self.max_box.w = w;
      self.max_box.h = h;
      self.max_box.x = self.x + s;
      self.max_box.y = self.y + s + (h+s)*i;
      i++;

      self.pool_box.w = w;
      self.pool_box.h = h;
      self.pool_box.x = self.x + s;
      self.pool_box.y = self.y + s + (h+s)*i;
      i++;

      self.graph_box.w = w;
      self.graph_box.h = h;
      self.graph_box.x = self.x + s;
      self.graph_box.y = self.y + s + (h+s)*i;
      i++;

      self.operator_box_mul.w = w;
      self.operator_box_mul.h = h;
      self.operator_box_mul.x = self.x + s;
      self.operator_box_mul.y = self.y + s + (h+s)*i;

      self.operator_box_div.w = w;
      self.operator_box_div.h = h;
      self.operator_box_div.x = self.x + s + (w+s);
      self.operator_box_div.y = self.y + s + (h+s)*i;
      i++;

      self.sign_box_pos.w = w;
      self.sign_box_pos.h = h;
      self.sign_box_pos.x = self.x + s;
      self.sign_box_pos.y = self.y + s + (h+s)*i;

      self.sign_box_neg.w = w;
      self.sign_box_neg.h = h;
      self.sign_box_neg.x = self.x + s + (w+s);
      self.sign_box_neg.y = self.y + s + (h+s)*i;
      i++;
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

      if(keyer.filter(self.title_box)) hit = true;
      if(dragger.filter(self.title_box)) hit = true;
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

    self.draw = function()
    {
      ctx.strokeRect(self.x,self.y,self.w,self.h);

      if(selected_module)
      {
        if(!selected_module.primary)    { self.title_box.draw(canv); ctx.fillStyle = black; ctx.fillText("title", self.title_box.x + self.title_box.w + 10, self.title_box.y+20); }
        if(!selected_module.lock_value)
        {
          self.v_box.draw(canv);
          ctx.fillStyle = black;
          if(selected_module.output_dongle.attachment)
            ctx.fillText("contribution",   self.v_box.x     + self.v_box.w     + 10, self.v_box.y    +20);
          if(selected_module.pool && !selected_module.output_dongle.attachment)
            ctx.fillText("starting val",   self.v_box.x     + self.v_box.w     + 10, self.v_box.y    +20);
        }
        if(!selected_module.cache_const)
        {
          if(!selected_module.lock_min) { self.min_box.draw(canv);   ctx.fillStyle = black; ctx.fillText("min",   self.min_box.x   + self.min_box.w   + 10, self.min_box.y+20); }
          if(!selected_module.lock_max) { self.max_box.draw(canv);   ctx.fillStyle = black; ctx.fillText("max",   self.max_box.x   + self.max_box.w   + 10, self.max_box.y+20); }
        }
        if(!selected_module.cache_const && !selected_module.lock_pool) { self.pool_box.draw(canv);  ctx.fillStyle = black; ctx.fillText("pool",  self.pool_box.x  + self.pool_box.w  + 10, self.pool_box.y+20); }
        if(!selected_module.lock_graph)                                { self.graph_box.draw(canv); ctx.fillStyle = black; ctx.fillText("graph", self.graph_box.x + self.graph_box.w + 10, self.graph_box.y+20); }

        if(selected_module.input_dongle.attachment && !selected_module.cache_const)
        {
          self.operator_box_mul.draw(canv);
          self.operator_box_div.draw(canv); ctx.fillStyle = black; ctx.fillText("mul/div",  self.operator_box_div.x + self.operator_box_div.w + 10, self.operator_box_div.y+20);
          self.sign_box_pos.draw(canv);
          self.sign_box_neg.draw(canv);     ctx.fillStyle = black; ctx.fillText("pos/nev",  self.sign_box_neg.x     + self.sign_box_neg.w     + 10, self.sign_box_neg.y+20);
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
      var adder = -1;
      if(m.input_dongle.attachment)
      {
        for(var j = 0; j < modules.length; j++)
          if(m.input_dongle.attachment == modules[j]) input = j;
      }
      if(m.output_dongle.attachment)
      {
        for(var j = 0; j < modules.length; j++)
          if(m.output_dongle.attachment == modules[j]) adder = j;
      }
      str += "{\"title\":\""+m.title+"\",\"type\":"+m.type+",\"v\":"+m.v_default+",\"min\":"+m.min+",\"max\":"+m.max+",\"pool\":"+m.pool+",\"graph\":"+m.graph+",\"wx\":"+m.wx+",\"wy\":"+m.wy+",\"ww\":"+m.ww+",\"wh\":"+m.wh+",\"input\":"+input+",\"adder\":"+adder+"}";
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
      m.plot[0] = m.v;
      m.prev_plot = m.v;
      modules.push(m);
    }
    for(var i = 0; i < t.modules.length; i++)
    {
      var tm = t.modules[i];
      if(tm.input >= 0)
        modules[i].input_dongle.attachment = modules[tm.input];
      if(tm.adder >= 0)
        modules[i].output_dongle.attachment = modules[tm.adder];
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
  var whippet_dongle = function(offx,offy,r,src)
  {
    var self = this;
    self.src = src;
    self.off = {x:offx,y:offy};
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;
    self.attachment = 0;

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.h/2+self.off.y,evt.doX,evt.doY) < self.r*self.r;
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
    }
    self.drag = function(evt)
    {
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
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
      resetGraph();
    }
  }

  ENUM = 0;
  var OPERATOR_MUL = ENUM; ENUM++;
  var OPERATOR_DIV = ENUM; ENUM++;
  ENUM = 0;
  var MODULE_TYPE_BOTH         = ENUM; ENUM++;
  var MODULE_TYPE_OBJECT       = ENUM; ENUM++;
  var MODULE_TYPE_RELATIONSHIP = ENUM; ENUM++;
  var module = function(wx,wy,ww,wh)
  {
    var self = this;

    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;
    screenSpace(work_cam,canv,self);

    self.title = "";
    self.color = good_colors[randIntBelow(good_colors.length)];
    self.primary = false;
    self.primary_index = 0;
    self.lock_move = false;
    self.lock_input = false;
    self.lock_output = false;
    self.lock_value = false;
    self.lock_min = false;
    self.lock_max = false;
    self.lock_pool = false;
    self.lock_graph = false;

    self.type = MODULE_TYPE_BOTH;
    self.v_default = 1;
    self.v = 1;
    self.v_temp = 1;
    self.v_lag = self.v;
    self.v_vel = 0;
    self.min = 0;
    self.max =  10;
    self.pool = 1;
    self.graph = 1;

    self.operator = OPERATOR_MUL;
    self.sign = 1.;

    self.cache_const = 0;
    self.cache_delta = 0;

    self.blob_s = 0;
    self.blob_s_vel = 0.5;

    self.val_s = 0.75;
    self.val_s_vel = 0.25;

    self.last_t = 1;

    self.prev_plot = 0;
    self.plot = [];

    self.input_dongle_vel = {x:0,y:0};
    self.output_dongle_vel = {x:0,y:0};

    self.input_dongle = new whippet_dongle( self.w,0,dongle_img.width/2,self);
    self.output_dongle = new whippet_dongle(-self.w,0,dongle_img.width/2,self);

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
      s_editor.calc_sub_values();
      self.drag_start_x = evt.doX-self.x;
      self.drag_start_y = evt.doY-self.y;
    }
    self.drag = function(evt)
    {
      self.x = evt.doX-self.drag_start_x;
      self.y = evt.doY-self.drag_start_y;
      worldSpaceCoords(work_cam,canv,self);
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self)
      {
        dragging_obj = 0;
        if(!self.primary && rectCollide(self.x,self.y,self.w,self.h,remove_module_btn.x,remove_module_btn.y,remove_module_btn.w,remove_module_btn.h))
        {
          if(selected_module == self)
            selected_module = 0;
          for(var i = 0; i < modules.length; i++)
          {
            if(modules[i].input_dongle.attachment  == self) modules[i].input_dongle.attachment = 0;
            if(modules[i].output_dongle.attachment == self) modules[i].output_dongle.attachment = 0;
          }
          for(var i = 0; i < modules.length; i++)
            if(modules[i] == self) modules.splice(i,1);
        }
        if(self.title == "") s_editor.title_box.focus();
      }
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
      ctx.strokeStyle = black

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
      if(selected_module == self)
      {
        var s = module_outline_s;
        ctx.drawImage(selected_module_img,self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
      }

      if(self.cache_const) return;

      //body
      var s = module_s;
      ctx.drawImage(module_img(self.color),self.x+self.w/2-s/2,self.y+self.h/2-s/2,s,s);
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
        img = module_pos_img;
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
    self.shouldShowInputDongle = function()
    {
      var should =
      (
        (
          self.type == MODULE_TYPE_BOTH &&
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
          self.type == MODULE_TYPE_RELATIONSHIP &&
          (self.input_dongle.attachment || self.input_dongle.dragging || self.output_dongle.attachment)
        )
      );
      return should;
    }
    self.shouldShowOutputDongle = function()
    {
      var should =
      (
        (
          self.type == MODULE_TYPE_BOTH &&
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
      );
      return should;
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
        base.x -= from.x*2.5;
        base.y -= from.y*2.5;
        ctx.beginPath();
        ctx.moveTo(base.x+target.x*5,base.y+target.y*5);
        ctx.lineTo(base.x+  from.x*5,base.y+  from.y*5);
        ctx.lineTo(base.x-target.x*5,base.y-target.y*5);
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
        base.x -= from.x*2.5;
        base.y -= from.y*2.5;
        ctx.beginPath();
        ctx.moveTo(base.x+target.x*5,base.y+target.y*5);
        ctx.lineTo(base.x+  from.x*5,base.y+  from.y*5);
        ctx.lineTo(base.x-target.x*5,base.y-target.y*5);
        ctx.stroke();
      }
    }
    self.drawBlob = function()
    {
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
      var s = module_inner_s*self.val_s;
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
    }

    var base = {x:0,y:0};
    var from = {x:0,y:0};
    var target = {x:0,y:0};
    var vel = {x:0,y:0};
    var ave = {x:0,y:0};
    self.tick = function()
    {
      var len;
      var dongle_r = 40;

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
          self.type == MODULE_TYPE_BOTH &&
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
          self.type == MODULE_TYPE_BOTH &&
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
    t_max = 50;

    load_template_i = 0;
    templates = [];
    /*empty*/            templates.push("{\"modules\":[]}");
    /*feedback loop*/    templates.push("{\"modules\":[{\"title\":\"microphone\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":-0.478125,\"wy\":0.16874999999999993,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"amp\",\"type\":0,\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.27812499999999996,\"wy\":0.15937500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"makes sound\",\"type\":0,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.08125000000000004,\"wy\":0.40312499999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"records sound\",\"type\":0,\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.12187499999999996,\"wy\":-0.05312500000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*normalizing loop*/ templates.push("{\"modules\":[{\"title\":\"bowl\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.275,\"wy\":0.046875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"kids\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.5125,\"wy\":0.09687499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"teachers\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.7562500000000002,\"wy\":0.36875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"each take jellybeans\",\"type\":0,\"v\":-1,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.034374999999999864,\"wy\":0.25625,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"each put jellybeans into\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.74375,\"wy\":0.10625000000000007,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"adder\":0},{\"title\":\"attracts kids\",\"type\":0,\"v\":0.9,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":0.09062499999999989,\"wy\":-0.12500000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*cycle*/            templates.push("{\"modules\":[{\"title\":\"rabbits\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.21562499999999996,\"wy\":0.2,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"eat\",\"type\":0,\"v\":-0.3,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.034375000000000044,\"wy\":0.4,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"nourish\",\"type\":0,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"title\":\"breed\",\"type\":0,\"v\":10,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.6625,\"wy\":0.21874999999999994,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0},{\"title\":\"die\",\"type\":0,\"v\":-10,\"min\":-10,\"max\":10,\"pool\":true,\"graph\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":1}]}");
    /*proportion cycle*/ templates.push("{\"modules\":[{\"title\":\"rabits\",\"type\":0,\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"foxes\",\"type\":0,\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"eat\",\"type\":0,\"v\":-0.4,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.009375000000000022,\"wy\":0.384375,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"nourish\",\"type\":0,\"v\":0.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"title\":\"breed\",\"type\":0,\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.665625,\"wy\":0.19999999999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":0},{\"title\":\"die\",\"type\":0,\"v\":-0.2,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.5,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":1}]}");
    /*circle of life*/   templates.push("{\"modules\":[{\"title\":\"sun\",\"type\":0,\"v\":10,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.4125,\"wy\":0.1062499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"grass\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.81875,\"wy\":0.078125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"gives light\",\"type\":0,\"v\":1,\"min\":0,\"max\":10,\"pool\":1,\"graph\":false,\"wx\":-1.1204999999999998,\"wy\":0.09262500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"title\":\"herbivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":-0.21425000000000005,\"wy\":0.08325000000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"nourishes\",\"type\":0,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.492375,\"wy\":0.20825,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":3},{\"title\":\"eats\",\"type\":0,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":-0.49550000000000005,\"wy\":-0.03862499999999991,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"adder\":1},{\"title\":\"carnivores\",\"type\":0,\"v\":1,\"min\":0,\"max\":100,\"pool\":1,\"graph\":1,\"wx\":0.3224999999999999,\"wy\":0.06737500000000013,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"nourishes\",\"type\":0,\"v\":1,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.044375000000000164,\"wy\":0.2017500000000001,\"ww\":0.15625,\"wh\":0.15625,\"input\":3,\"adder\":6},{\"title\":\"eats\",\"type\":0,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.038125000000000075,\"wy\":-0.05762499999999995,\"ww\":0.15625,\"wh\":0.15625,\"input\":6,\"adder\":3},{\"title\":\"\",\"type\":0,\"v\":-0.5,\"min\":-1,\"max\":1,\"pool\":1,\"graph\":false,\"wx\":0.6540000000000006,\"wy\":0.07125000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":6,\"adder\":6}]}");

    s_dragger = new screen_dragger();
    s_graph = new graph();
    s_graph.x = 0;
    s_graph.y = canv.height-100;
    s_graph.w = canv.width-100;
    s_graph.h = 100;
    s_graph.calc_sub_params();
    s_editor = new module_editor();
    s_editor.x = canv.width-100;
    s_editor.y = 100;
    s_editor.w = 100;
    s_editor.h = canv.height-100;
    s_editor.calc_sub_params();

    speed_slider = new SliderBox(s_graph.x+100,s_graph.y-20,100,15,1,250,advance_timer_max,
      function(v)
      {
        if(!levels[cur_level_i].speed_enabled) return;
        v = round(v);
        var t = advance_timer/advance_timer_max;
        advance_timer_max = v;
        advance_timer = ceil(advance_timer_max * t);
      }
    )

    var dragOutModule = function(type,btn,evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,btn))
      {
        var m = new module(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),worldSpaceW(work_cam,canv,module_s),worldSpaceH(work_cam,canv,module_s));
        m.type = type;
        if(type == MODULE_TYPE_RELATIONSHIP)
        m.graph = 0;
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        modules.push(m);
        resetGraph();
      }
      return false;
    }

    add_object_btn = new btn();
    add_object_btn.w = 50;
    add_object_btn.h = 20;
    add_object_btn.x = 10;
    add_object_btn.y = 10;
    add_object_btn.shouldDrag = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].add_object_enabled) return false;
      return dragOutModule(MODULE_TYPE_OBJECT,add_object_btn,evt);
    }

    add_relationship_btn = new btn();
    add_relationship_btn.w = 50;
    add_relationship_btn.h = 20;
    add_relationship_btn.x = 10;
    add_relationship_btn.y = add_object_btn.y+add_object_btn.h+10;
    add_relationship_btn.shouldDrag = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].add_relationship_enabled) return false;
      return dragOutModule(MODULE_TYPE_RELATIONSHIP,add_relationship_btn,evt);
    }

    add_module_btn = new btn();
    add_module_btn.w = 50;
    add_module_btn.h = 20;
    add_module_btn.x = 10;
    add_module_btn.y = add_relationship_btn.y+add_relationship_btn.h+10;
    add_module_btn.shouldDrag = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].add_module_enabled) return false;
      return dragOutModule(MODULE_TYPE_BOTH,add_module_btn,evt);
    }

    //kind of a hack- just placeholder that gets checked by modules themselves
    remove_module_btn = new btn();
    remove_module_btn.w = 50;
    remove_module_btn.h = 20;
    remove_module_btn.x = 10;
    remove_module_btn.y = add_module_btn.y+add_module_btn.h+10;

    next_level_btn = new btn();
    next_level_btn.w = 60;
    next_level_btn.h = 20;
    next_level_btn.x = 440;
    next_level_btn.y = 80;
    next_level_btn.click = function(evt)
    {
      if(levelComplete()) nextLevel();
    }

    print_btn = new btn();
    print_btn.w = 60;
    print_btn.h = 20;
    print_btn.x = canv.width-print_btn.w-10;
    print_btn.y = 10;
    print_btn.click = function(evt)
    {
      if(levels[cur_level_i] && !levels[cur_level_i].save_enabled) return false;
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

    nextLevel();
  };

  var resetGraph = function()
  {
    var old_predict = predict;
    predict = true;
    for(var j = 0; j < 1 || (predict && j < 2); j++)
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
      if(predict && j == 0)
      {
        for(var i = 0; i < t_max; i++)
          flow();
      }
    }
    predict = old_predict;
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
    var clicked = false;
    if(s_editor.filter())                    clicked = true;
    if(dragger.filter(speed_slider))         clicked = true;
    if(clicker.filter(s_graph.pause_btn))    clicked = true;
    if(clicker.filter(s_graph.advance_btn))  clicked = true;
    if(clicker.filter(s_graph.reset_btn))    clicked = true;
    if(clicker.filter(next_level_btn))       clicked = true;
    if(clicker.filter(print_btn))            clicked = true;
    if(clicker.filter(load_btn))             clicked = true;
    if(dragger.filter(add_object_btn))       clicked = true;
    if(dragger.filter(add_relationship_btn)) clicked = true;
    //if(dragger.filter(add_module_btn))       clicked = true;
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

    clicker.flush();
    dragger.flush();
    hoverer.flush();
    keyer.flush();
    blurer.flush();

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
  };

  self.draw = function()
  {
    calc_caches();
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0,0,canv.width,canv.height);

    ctx.fillStyle = black;
    ctx.strokeStyle = black;
    ctx.lineWidth = 1;
    ctx.textAlign = "left";
    if(!levels[cur_level_i] || levels[cur_level_i].add_object_enabled)
    {
      ctx.fillText("+Object",add_object_btn.x+2,add_object_btn.y+10);
      ctx.strokeRect(add_object_btn.x,add_object_btn.y,add_object_btn.w,add_object_btn.h);
    }
    if(!levels[cur_level_i] || levels[cur_level_i].add_relationship_enabled)
    {
      ctx.fillText("+Action",add_relationship_btn.x+2,add_relationship_btn.y+10);
      ctx.strokeRect(add_relationship_btn.x,add_relationship_btn.y,add_relationship_btn.w,add_relationship_btn.h);
    }
    if(!levels[cur_level_i] || levels[cur_level_i].add_module_enabled)
    {
      ctx.fillText("+Module",add_module_btn.x+2,add_module_btn.y+10);
      ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);
    }
    if(!levels[cur_level_i] || levels[cur_level_i].remove_enabled)
    {
      ctx.fillText("Remove",remove_module_btn.x+2,remove_module_btn.y+10);
      ctx.strokeRect(remove_module_btn.x,remove_module_btn.y,remove_module_btn.w,remove_module_btn.h);
    }
    ctx.fillStyle = "#AAAAAA";
    if(!levelComplete())
      ctx.fillRect(next_level_btn.x,next_level_btn.y,next_level_btn.w,next_level_btn.h);
    ctx.fillStyle = black;
    ctx.textAlign = "right";
    ctx.fillText("Next Level",next_level_btn.x+next_level_btn.w-2,next_level_btn.y+10);
    ctx.strokeRect(next_level_btn.x,next_level_btn.y,next_level_btn.w,next_level_btn.h);
    if(!levels[cur_level_i] || levels[cur_level_i].save_enabled)
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

    ctx.textAlign = "center";

    for(var i = 0; i < modules.length; i++)
      screenSpace(work_cam,canv,modules[i]);

    for(var i = 0; i < modules.length; i++)
      modules[i].drawLines();
    for(var i = 0; i < modules.length; i++)
      modules[i].drawBody();
    for(var i = 0; i < modules.length; i++)
      modules[i].drawDongles();
    for(var i = 0; i < modules.length; i++)
      modules[i].drawBlob();
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

    var targets = levels[cur_level_i].primary_module_target_vals;
    var targets_x = 350;
    var targets_y = 10;
    var xpad = 40;
    var ypad = 14;
    if(targets && targets.length)
    {
      ctx.lineWidth = 1;
      ctx.textAlign = "center";
      ctx.fillStyle = black;
      ctx.strokeRect(targets_x, targets_y, xpad*2, ypad*(targets[0].length+2));
      var window_y = min(targets_y+ypad*((t_i+(1-(advance_timer/advance_timer_max)))+1)+4,targets_y+ypad*(targets[0].length+2)-12);
      ctx.strokeRect(targets_x, window_y, xpad*2, 20-8);
      for(var j = 0; j < targets.length; j++)
      {
        ctx.fillText("data",targets_x+xpad*(2*j)+xpad/2,targets_y+ypad);
        ctx.fillText("sim",targets_x+xpad*(2*j+1)+xpad/2,targets_y+ypad);
      }
      for(var i = 0; i < targets[0].length; i++) //inverted loop
      {
        ctx.fillStyle = black;
        for(var j = 0; j < targets.length; j++)
        {
          ctx.fillStyle = black;
          ctx.fillText(targets[j][i],targets_x+xpad*(2*j)+xpad/2,targets_y+ypad*(i+2)); //target
          if(t_i >= i)
          {
            var x = targets_x+xpad*(2*j+1)+xpad/2;
            var y = targets_y+ypad*(i+2);
            if(modules[j].plot[i] == targets[j][i])
            {
              ctx.fillStyle = green;
              ctx.fillText("✔",x+10,y);
            }
            else
            {
              ctx.fillStyle = red;
              ctx.fillText("✘",x+10,y);
            }
            ctx.fillText(modules[j].plot[i],x,y); //value
          }
        }
      }
    }
    levels[cur_level_i].draw();
    ctx.lineWidth = 1;

    s_graph.draw();
    ctx.textAlign = "left";
    s_editor.draw();
    if(levels[cur_level_i].speed_enabled)
    {
      ctx.fillStyle = black;
      ctx.fillText("Speed:",speed_slider.x,speed_slider.y-10);
      speed_slider.draw(canv);
    }
  };

  self.cleanup = function()
  {
  };

};

