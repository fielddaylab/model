var GamePlayScene = function(game, stage)
{
  var self = this;

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
  var print_btn;
  var load_btn;
  var load_template_i;
  var templates;

  var s_dragger;
  var s_graph;
  var s_editor;

  var w = 20;
  var h = 20;
  var dongle_img = GenIcon(w,h)
  dongle_img.context.fillStyle = "#FF4444";
  dongle_img.context.strokeStyle = "#FFFFFF";
  dongle_img.context.lineWidth = 1;
  dongle_img.context.beginPath();
  dongle_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  dongle_img.context.fill();
  dongle_img.context.stroke();

  var w = 50;
  var h = 50;
  var module_img = GenIcon(w,h)
  module_img.context.fillStyle = "#BBBBBB";
  module_img.context.strokeStyle = "#FFFFFF";
  module_img.context.lineWidth = 1;
  module_img.context.beginPath();
  module_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  module_img.context.fill();
  module_img.context.stroke();

  var w = 40;
  var h = 40;
  var glob_img = GenIcon(w,h)
  glob_img.context.fillStyle = "#FF4444";
  glob_img.context.strokeStyle = "#FFFFFF";
  glob_img.context.lineWidth = 1;
  glob_img.context.beginPath();
  glob_img.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  glob_img.context.fill();
  glob_img.context.stroke();

  var precision = 2;

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
      if(!dragging_obj) full_pause = !full_pause;
    }

    self.advance_btn = new btn();
    self.advance_btn.click = function(evt)
    {
      if(!dragging_obj && advance_timer == advance_timer_max) advance_timer--;
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
      ctx.strokeStyle = "#000000";
      var x = 0;
      var y = 0;

      for(var i = 0; i < modules.length; i++)
      {
        if(!modules[i].graph) continue;
        x = self.graph_x;
        y = self.graph_y+self.graph_h;
        ctx.beginPath();
        if(!isNaN(modules[i].plot[0])) y = self.graph_y+self.graph_h - mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[0])*self.graph_h;
        ctx.moveTo(x,y);
        for(var j = 0; j < t_max; j++)
        {
          x = self.graph_x + (j/(t_max-1)) * self.graph_w;
          if(!isNaN(modules[i].plot[j])) y = self.graph_y+self.graph_h - (mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[j])*self.graph_h);
          ctx.lineTo(x,y);
          if(j == t_i)
          {
            if(!isNaN(modules[i].prev_plot)) y = self.graph_y+self.graph_h - (mapVal(modules[i].min,modules[i].max,0,1,modules[i].prev_plot)*self.graph_h);
            ctx.lineTo(x,y);
          }
        }
        ctx.stroke();
      }

      x = self.graph_x+ (t_i/(t_max-1)) * self.graph_w;
      ctx.beginPath();
      ctx.moveTo(x,self.graph_y);
      ctx.lineTo(x,self.graph_y+self.graph_h);
      ctx.stroke();

      ctx.strokeRect(self.x,self.y,self.w,self.h);
      ctx.strokeRect(self.graph_x,self.graph_y,self.graph_w,self.graph_h);

      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.fillText("||",self.pause_btn.x+2,self.pause_btn.y+10);
      ctx.strokeRect(self.pause_btn.x,self.pause_btn.y,self.pause_btn.w,self.pause_btn.h);
      ctx.fillText(">",self.advance_btn.x+2,self.advance_btn.y+10);
      ctx.strokeRect(self.advance_btn.x,self.advance_btn.y,self.advance_btn.w,self.advance_btn.h);
      ctx.fillText("<",self.reset_btn.x+2,self.reset_btn.y+10);
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

    self.title_box = new TextBox(0,0,0,0,"",   function(v){ var new_v = v;                                                         var old_v = selected_module.title;     selected_module.title     = new_v; });
    self.v_box     = new NumberBox(0,0,0,0,0,0,function(v){ var new_v = fdisp(clamp(selected_module.min,selected_module.max,v),2); var old_v = selected_module.v_default; selected_module.v_default = new_v; if(new_v != old_v) resetGraph(); if(new_v != v) self.v_box.set(new_v); });
    self.min_box   = new NumberBox(0,0,0,0,0,0,function(v){ var new_v = fdisp(min(selected_module.max,v),2);                       var old_v = selected_module.min;       selected_module.min       = new_v; if(new_v != old_v) resetGraph(); if(new_v != v) { self.min_box.set(new_v); self.v_box.set(max(selected_module.v,new_v)); } else { var delta = max((selected_module.max-selected_module.min),1)/100; self.v_box.delta = delta; self.min_box.delta = delta; self.max_box.delta = delta; } });
    self.max_box   = new NumberBox(0,0,0,0,0,0,function(v){ var new_v = fdisp(max(selected_module.min,v),2);                       var old_v = selected_module.max;       selected_module.max       = new_v; if(new_v != old_v) resetGraph(); if(new_v != v) { self.max_box.set(new_v); self.v_box.set(min(selected_module.v,new_v)); } else { var delta = max((selected_module.max-selected_module.min),1)/100; self.v_box.delta = delta; self.min_box.delta = delta; self.max_box.delta = delta; } });
    self.pool_box  = new ToggleBox(0,0,0,0,0,  function(v){ var new_v = v;                                                         var old_v = selected_module.pool;      selected_module.pool      = new_v; if(new_v != old_v) resetGraph(); });
    self.graph_box = new ToggleBox(0,0,0,0,0,  function(v){ var new_v = v;                                                         var old_v = selected_module.graph;     selected_module.graph     = new_v; });

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
      if(!selected_module) return;
      dragger.filter(self);

      keyer.filter(self.title_box);
      dragger.filter(self.title_box);
      blurer.filter(self.title_box);

      keyer.filter(self.v_box);
      dragger.filter(self.v_box);
      blurer.filter(self.v_box);

      keyer.filter(self.min_box);
      dragger.filter(self.min_box);
      blurer.filter(self.min_box);

      keyer.filter(self.max_box);
      dragger.filter(self.max_box);
      blurer.filter(self.max_box);

      clicker.filter(self.pool_box);
      clicker.filter(self.graph_box);
      clicker.filter(self.operator_box_mul);
      clicker.filter(self.operator_box_div);
      clicker.filter(self.sign_box_pos);
      clicker.filter(self.sign_box_neg);
    }
    self.draw = function()
    {
      ctx.strokeRect(self.x,self.y,self.w,self.h);

      if(selected_module)
      {
        self.title_box.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("title", self.title_box.x     + self.title_box.w     + 10, self.title_box.y+20);
        self.v_box.draw(canv);     ctx.fillStyle = "#000000"; ctx.fillText("val",   self.v_box.x     + self.v_box.w     + 10, self.v_box.y+20);
        self.min_box.draw(canv);   ctx.fillStyle = "#000000"; ctx.fillText("min",   self.min_box.x   + self.min_box.w   + 10, self.min_box.y+20);
        self.max_box.draw(canv);   ctx.fillStyle = "#000000"; ctx.fillText("max",   self.max_box.x   + self.max_box.w   + 10, self.max_box.y+20);
        self.pool_box.draw(canv);  ctx.fillStyle = "#000000"; ctx.fillText("pool",  self.pool_box.x  + self.pool_box.w  + 10, self.pool_box.y+20);
        self.graph_box.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("graph", self.graph_box.x + self.graph_box.w + 10, self.graph_box.y+20);

        if(selected_module.input_dongle.attachment)
        {
          self.operator_box_mul.draw(canv);
          self.operator_box_div.draw(canv); ctx.fillStyle = "#000000"; ctx.fillText("mul/div",  self.operator_box_div.x + self.operator_box_div.w + 10, self.operator_box_div.y+20);
          self.sign_box_pos.draw(canv);
          self.sign_box_neg.draw(canv);     ctx.fillStyle = "#000000"; ctx.fillText("pos/nev",  self.sign_box_neg.x     + self.sign_box_neg.w     + 10, self.sign_box_neg.y+20);
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
      str += "{\"title\":\""+m.title+"\",\"v\":"+m.v_default+",\"min\":"+m.min+",\"max\":"+m.max+",\"pool\":"+m.pool+",\"graph\":"+m.graph+",\"wx\":"+m.wx+",\"wy\":"+m.wy+",\"ww\":"+m.ww+",\"wh\":"+m.wh+",\"input\":"+input+",\"adder\":"+adder+"}";
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
      m.v_default = tm.v;
      m.v = m.v_default;
      m.min = tm.min;
      m.max = tm.max;
      m.pool = tm.pool;
      m.graph = tm.graph;
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

    self.title = "-";
    self.color = "#0000FF";
    self.damp_color = "rgba(200,200,200,0.5)";

    self.selected = 0;

    self.v_default = 0;
    self.v = 0;
    self.v_temp = 0;
    self.min = -10;
    self.max =  100;
    self.pool = 1;
    self.graph = 0;

    self.operator = OPERATOR_MUL;
    self.sign = 1.;

    self.cache_const = 0;
    self.cache_contributes = 0;

    self.prev_plot = 0;
    self.plot = [];

    self.v_dongle = new dongle(0,0,dongle_img.width/2,self);
    self.v_dongle.drag = function(evt)
    {
      self.v_dongle.delta = (self.v_dongle.drag_start_y-evt.doY)/10;
      self.v_temp = clamp(self.min,self.max,self.v+self.v_dongle.delta);
    }
    self.v_dongle.dragFinish = function(evt)
    {
      if(dragging_obj == self.v_dongle) dragging_obj = 0;
      drag_pause = false;
      self.v = self.v_temp;
    }

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
      if(dragging_obj == self) dragging_obj = 0;
    }

    self.hover   = function(){}
    self.unhover = function(){}

    self.draw_bg = function()
    {
      //input_dongle_line
      ctx.strokeStyle = "#000000"
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
      ctx.strokeStyle = "#000000"
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
    }

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
    var bounce = [];
    var bounce_s = 1;
    var bounce_vel = 0.3;
    for(var i = 0; i < 100; i++)
    {
      bounce[i] = bounce_s;
      bounce_s += bounce_vel;
      bounce_vel += (1-bounce_s)/8.;
      bounce_vel *= 0.85;
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
        }
        else
        {
          glob_0.x = self.input_dongle.attachment.x+self.input_dongle.attachment.w/2;
          glob_0.y = self.input_dongle.attachment.y+self.input_dongle.attachment.h/2;
          glob_1.x = self.x+self.w/2+self.input_dongle.off.x;
          glob_1.y = self.y+self.h/2+self.input_dongle.off.y;
        }
        glob_2.x = self.x+self.w/2+self.output_dongle.off.x;
        glob_2.y = self.y+self.h/2+self.output_dongle.off.y;
        glob_3.x = self.output_dongle.attachment.x+self.output_dongle.attachment.w/2;
        glob_3.y = self.output_dongle.attachment.y+self.output_dongle.attachment.h/2;
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
        var s = bounce[floor(t_t*bounce.length-0.001)];
        var ts = 20;
        ctx.drawImage(glob_img,x-s*ts/2,y-s*ts/2,s*ts,s*ts);
      }
    }

    self.draw = function()
    {
      ctx.drawImage(module_img,self.x,self.y,self.w,self.h);

      //fill
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(self.x,self.y,self.w,self.h);
      ctx.fillStyle = self.color;
      var p  = 1;
      var zp = 0;
      if(self.min != self.max)
      {
        p  = mapVal(self.min,self.max,0,1,self.v);
        zp = mapVal(self.min,self.max,0,1,clamp(self.min,self.max,0));
      }
      ctx.fillRect(self.x,self.y+self.h*(1-zp),self.w,-self.h*(p-zp));
      if(self.v_dongle.dragging)
      {
        ctx.fillStyle = self.damp_color;
        var p = self.v_temp/max(abs(self.min),abs(self.max));
        ctx.fillRect(self.x,self.y+self.h*(1-p),self.w,self.h*p);
      }

      //input_dongle
      if(self.input_dongle.attachment || self.input_dongle.dragging || (self.output_dongle.attachment && self.hovering && !dragging_obj))
      {
        ctx.strokeStyle = "#668866";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
        ctx.lineTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
        ctx.stroke();
        ctx.drawImage(dongle_img,self.x+self.w/2+self.input_dongle.off.x-self.input_dongle.r,self.y+self.h/2+self.input_dongle.off.y-self.input_dongle.r,self.input_dongle.r*2,self.input_dongle.r*2);
      }

      self.drawBlob();

      //output_dongle
      if(self.output_dongle.attachment || self.output_dongle.dragging || (self.hovering && !dragging_obj))
      {
        ctx.lineWidth = self.v/max(abs(self.min),abs(self.max))*dongle_img.width/2;
        if(self.v > 0)
          ctx.strokeStyle = "#6666FF";
        else if(self.v < 0)
          ctx.strokeStyle = "#FF6666";
        if(self.v != 0)
        {
          ctx.beginPath();
          ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
          ctx.lineTo(self.x+self.w/2+self.output_dongle.off.x,self.y+self.h/2+self.output_dongle.off.y);
          ctx.stroke();
        }
        ctx.drawImage(dongle_img,self.x+self.w/2+self.output_dongle.off.x-self.output_dongle.r,self.y+self.h/2+self.output_dongle.off.y-self.output_dongle.r,self.output_dongle.r*2,self.output_dongle.r*2);

        if(self.v_dongle.dragging)
        {
          ctx.globalAlpha = 0.5;
          ctx.lineWidth = self.v_temp/max(abs(self.min),abs(self.max))*dongle_img.width/2;
          if(self.v_temp*self.v > 0) //neither zero, same sign
            ctx.strokeStyle = "#666666";
          else if(self.v_temp > 0)
            ctx.strokeStyle = "#6666FF";
          else if(self.v_temp < 0)
            ctx.strokeStyle = "#FF6666";
          if(self.v_temp != 0)
          {
            ctx.beginPath();
            ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
            ctx.lineTo(self.x+self.w/2+self.output_dongle.off.x,self.y+self.h/2+self.output_dongle.off.y);
            ctx.stroke();
          }
          ctx.globalAlpha = 1.;
        }
      }

      //v_dongle
      ctx.drawImage(dongle_img,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r,self.y+self.h/2+self.v_dongle.off.y-self.v_dongle.r,self.v_dongle.r*2,self.v_dongle.r*2);
      ctx.fillStyle = "#000000"
      if(self.v_dongle.dragging) ctx.fillText(fdisp(self.v_temp,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);
      else                       ctx.fillText(fdisp(self.v     ,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);

      ctx.fillStyle = "#000000";
      ctx.fillText(self.title,self.x+self.w/2,self.y-10);
    }

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

      if(!self.output_dongle.attachment && !self.output_dongle.dragging && self.hovering && !dragging_obj)
      {
        self.output_dongle.off.x = 20;
        self.output_dongle.off.y = 0;
      }
      if(!self.input_dongle.attachment && !self.input_dongle.dragging && self.output_dongle.attachment && self.hovering && !dragging_obj)
      {
        self.input_dongle.off.x = -20;
        self.input_dongle.off.y = 0;
      }
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
    full_pause = true;
    drag_pause = false;
    advance_timer_max = 100;
    advance_timer = advance_timer_max;
    t_i = 0;
    t_max = 100

    load_template_i = 0;
    templates = [];
    /*empty*/            templates.push("{\"modules\":[]}");
    /*feedback loop*/    templates.push("{\"modules\":[{\"title\":\"microphone\",\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":-0.478125,\"wy\":0.16874999999999993,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"amp\",\"v\":0,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.27812499999999996,\"wy\":0.15937500000000004,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"makes sound\",\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.08125000000000004,\"wy\":0.40312499999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"records sound\",\"v\":1.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.12187499999999996,\"wy\":-0.05312500000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*normalizing loop*/ templates.push("{\"modules\":[{\"title\":\"bowl\",\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.275,\"wy\":0.046875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"kids\",\"v\":50,\"min\":0,\"max\":100,\"pool\":0,\"graph\":true,\"wx\":0.5125,\"wy\":0.09687499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"teachers\",\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.7562500000000002,\"wy\":0.36875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"each take jellybeans\",\"v\":-1,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.034374999999999864,\"wy\":0.25625,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"each put jellybeans into\",\"v\":1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.74375,\"wy\":0.10625000000000007,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"adder\":0},{\"title\":\"attracts kids\",\"v\":0.9,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":0.09062499999999989,\"wy\":-0.12500000000000006,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*cycle*/            templates.push("{\"modules\":[{\"title\":\"rabbits\",\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"foxes\",\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.21562499999999996,\"wy\":0.2,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"eat\",\"v\":-0.3,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.034375000000000044,\"wy\":0.4,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"nourish\",\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"title\":\"breed\",\"v\":10,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.6625,\"wy\":0.21874999999999994,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0},{\"title\":\"die\",\"v\":-10,\"min\":-10,\"max\":10,\"pool\":true,\"graph\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":1}]}");
    /*proportion cycle*/ templates.push("{\"modules\":[{\"title\":\"rabits\",\"v\":100,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"foxes\",\"v\":50,\"min\":0,\"max\":100,\"pool\":true,\"graph\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"title\":\"eat\",\"v\":-0.4,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":-0.009375000000000022,\"wy\":0.384375,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"title\":\"nourish\",\"v\":0.1,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"title\":\"breed\",\"v\":0.3,\"min\":0,\"max\":100,\"pool\":true,\"graph\":0,\"wx\":-0.665625,\"wy\":0.19999999999999996,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":0},{\"title\":\"die\",\"v\":-0.2,\"min\":-1,\"max\":1,\"pool\":true,\"graph\":0,\"wx\":0.5,\"wy\":0.15,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":1}]}");

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

    add_module_btn = new btn();
    add_module_btn.w = 20;
    add_module_btn.h = 20;
    add_module_btn.x = 10;
    add_module_btn.y = 10;
    add_module_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,add_module_btn))
      {
        var m = new module(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),worldSpaceW(work_cam,canv,module_img.width),worldSpaceH(work_cam,canv,module_img.height));
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        modules.push(m);
      }
      return false;
    }

    print_btn = new btn();
    print_btn.w = 20;
    print_btn.h = 20;
    print_btn.x = canv.width-30;
    print_btn.y = 10;
    print_btn.click = function(evt)
    {
      if(!dragging_obj) print_template();
    }

    load_btn = new btn();
    load_btn.w = 20;
    load_btn.h = 20;
    load_btn.x = canv.width-30;
    load_btn.y = 40;
    load_btn.click = function(evt)
    {
      if(!dragging_obj)
      {
        load_next_template();
        resetGraph();
      }
    }
  };

  var resetGraph = function()
  {
    t_i = 0;
    advance_timer = advance_timer_max;
    for(var i = 0; i < modules.length; i++)
    {
      modules[i].v = modules[i].v_default;
      modules[i].plot[0] = modules[i].v;
      modules[i].prev_plot = modules[i].plot[0];
    }
    //for(var i = 0; i < 100; i++)
      //flow();
    t_i = 0;
    advance_timer = advance_timer_max;
    for(var i = 0; i < modules.length; i++)
    {
      modules[i].v = modules[i].v_default;
      modules[i].plot[0] = modules[i].v;
      modules[i].prev_plot = modules[i].plot[0];
    }
  }

  var calc_caches = function()
  {
    for(var i = 0; i < modules.length; i++)
    {
      modules[i].cache_const = 1;
      modules[i].cache_contributes = 0;
    }
    for(var i = 0; i < modules.length; i++)
    {
      if(modules[i].output_dongle.attachment)
      {
        modules[i].cache_contributes = 1;
        modules[i].output_dongle.attachment.cache_const = 0;
      }
    }
  }

  var flow = function()
  {
    t_i = (t_i+1)%t_max;

    for(var i = 0; i < modules.length; i++)
      modules[i].prev_plot = modules[i].plot[t_i];

    advance_timer = advance_timer_max;
    for(var i = 0; i < modules.length; i++)
      if(modules[i].pool) modules[i].v_temp = modules[i].v;
      else                modules[i].v_temp = 0;

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
      modules[i].v = modules[i].v_temp;
      modules[i].plot[t_i] = modules[i].v;
    }
  }

  self.tick = function()
  {
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].v_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].input_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].output_dongle);
    for(var i = 0; i < modules.length; i++)
    {
      dragger.filter(modules[i]);
      hoverer.filter(modules[i]);
    }
    dragger.filter(add_module_btn);
    var clicked = false;
    if(clicker.filter(s_graph.pause_btn))   clicked = true;
    if(clicker.filter(s_graph.advance_btn)) clicked = true;
    if(clicker.filter(s_graph.reset_btn))   clicked = true;
    if(clicker.filter(print_btn))           clicked = true;
    if(clicker.filter(load_btn))            clicked = true;
    s_editor.filter();
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

    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.fillText("Add Module",add_module_btn.x+2,add_module_btn.y+10);
    ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);
    ctx.fillText("Save",print_btn.x+2,print_btn.y+10);
    ctx.strokeRect(print_btn.x,print_btn.y,print_btn.w,print_btn.h);
    ctx.fillText("Load Next",load_btn.x+2,load_btn.y+10);
    ctx.fillText("("+load_template_i+"/"+(templates.length-1)+")",load_btn.x+2,load_btn.y+30);
    ctx.strokeRect(load_btn.x,load_btn.y,load_btn.w,load_btn.h);

    for(var i = 0; i < modules.length; i++)
      screenSpace(work_cam,canv,modules[i]);

    for(var i = 0; i < modules.length; i++)
      modules[i].draw_bg();
    for(var i = 0; i < modules.length; i++)
      modules[i].draw();

    var tmp_pause = false;
    if(
      s_editor.v_box.focused ||
      s_editor.min_box.focused ||
      s_editor.max_box.focused
    )
      tmp_pause = true;
    if(drag_pause || full_pause || tmp_pause)
    {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0,0,canv.width,canv.height);
    }

    s_graph.draw();
    s_editor.draw();
  };

  self.cleanup = function()
  {
  };

};

