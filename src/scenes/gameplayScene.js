var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var dragger;
  var clicker;

  var screen_cam;
  var work_cam;

  var modules;
  var dragging_obj;
  var full_pause;
  var drag_pause;
  var tick_timer;
  var max_tick_timer;
  var max_tick_i;
  var tick_i;

  var add_module_btn;
  var pause_btn;
  var advance_btn;
  var speed_btn;
  var print_btn;
  var load_btn;
  var load_template_i;
  var templates;

  var s_dragger;

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

  var precision = 2;

  var screen_dragger = function()
  {
    var self = this;
    self.last_x = 0
    self.last_y = 0
    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
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
      str += "{\"v\":"+m.v+",\"min\":"+m.min+",\"max\":"+m.max+",\"pool\":"+m.pool+",\"graph\":"+m.graph+",\"square\":"+m.square+",\"wx\":"+m.wx+",\"wy\":"+m.wy+",\"ww\":"+m.ww+",\"wh\":"+m.wh+",\"input\":"+input+",\"adder\":"+adder+"}";
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
      m.v = tm.v;
      m.min = tm.min;
      m.max = tm.max;
      m.pool = tm.pool;
      m.graph = tm.graph;
      m.square = tm.square;
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

  var btn = function(wx,wy,ww,wh)
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
      tick_timer = 0;
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
      self.drag_start_x = evt.doX;
      self.drag_start_y = evt.doY;
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
      if(self.attachment) self.attachment = 0;
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

    self.title = "blarb";
    self.color = "#0000FF";
    self.damp_color = "rgba(200,200,200,0.5)";

    self.v = 0;
    self.v_temp = 0;
    self.min = -10;
    self.max =  100;
    self.pool = 0;
    self.graph = 0;

    self.operator = OPERATOR_MUL;
    self.sign = 1.;

    self.scale = 1.;

    self.cache_const = 0;

    self.plot = [];

    self.pool_dongle  = new toggle_dongle(0,-30,dongle_img.width/2,self);
    self.pool_dongle.dragStart = function(evt) { self.pool = !self.pool; self.pool_dongle.dragging = false; }
    self.graph_dongle = new toggle_dongle(0,-20,dongle_img.width/2,self);
    self.graph_dongle.dragStart = function(evt) { self.graph = !self.graph; self.graph_dongle.dragging = false; }
    self.square_dongle  = new toggle_dongle(0,-10,dongle_img.width/2,self);
    self.square_dongle.dragStart = function(evt) { self.square = !self.square; self.square_dongle.dragging = false; }

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

    self.draw = function()
    {
      //title
      //ctx.fillStyle = "#000000";
      //ctx.fillText(self.title,self.x,self.y-10);

      ctx.drawImage(module_img,self.x,self.y,self.w,self.h);

      if(!self.square)
      {
        //input_dongle
        ctx.strokeStyle = "#668866";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
        ctx.lineTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
        ctx.stroke();
        ctx.drawImage(dongle_img,self.x+self.w/2+self.input_dongle.off.x-self.input_dongle.r,self.y+self.h/2+self.input_dongle.off.y-self.input_dongle.r,self.input_dongle.r*2,self.input_dongle.r*2);

        if(!self.input_dongle.attachment)
        {
          ctx.fillStyle = "#000000";
          ctx.fillText("1",self.x+self.w/2+self.input_dongle.off.x-self.input_dongle.r/2,self.y+self.h/2+self.input_dongle.off.y+self.input_dongle.r/2);
        }

        //output_dongle
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
        ctx.drawImage(dongle_img,self.x+self.w/2+self.output_dongle.off.x-self.output_dongle.r,self.y+self.h/2+self.output_dongle.off.y-self.output_dongle.r,self.output_dongle.r*2,self.output_dongle.r*2);
      }
      else
      {
        //title
        //ctx.fillStyle = "#000000";
        //ctx.fillText(self.title,self.x,self.y-10);

        //fill
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(self.x,self.y,self.w,self.h);
        ctx.fillStyle = self.color;
        var p = self.v/max(abs(self.min),abs(self.max));
        ctx.fillRect(self.x,self.y+self.h*(1-p),self.w,self.h*p);
        if(self.v_dongle.dragging)
        {
          ctx.fillStyle = self.damp_color;
          var p = self.v_temp/max(abs(self.min),abs(self.max));
          ctx.fillRect(self.x,self.y+self.h*(1-p),self.w,self.h*p);
        }
      }

      //v_dongle
      ctx.drawImage(dongle_img,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r,self.y+self.h/2+self.v_dongle.off.y-self.v_dongle.r,self.v_dongle.r*2,self.v_dongle.r*2);
      ctx.fillStyle = "#000000"
      if(self.v_dongle.dragging) ctx.fillText(fdisp(self.v_temp,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);
      else                       ctx.fillText(fdisp(self.v     ,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);

      //pool_dongle
      ctx.fillStyle = "#000000";
      //ctx.drawImage(dongle_img,self.x+self.w/2+self.pool_dongle.off.x-self.pool_dongle.r,self.y+self.h/2+self.pool_dongle.off.y-self.pool_dongle.r,self.pool_dongle.r*2,self.pool_dongle.r*2);
      if(self.pool) ctx.fillText("o",self.x+self.w/2+self.pool_dongle.off.x-self.pool_dongle.r/2,self.y+self.h/2+self.pool_dongle.off.y+self.pool_dongle.r/2);
      else          ctx.fillText("-",self.x+self.w/2+self.pool_dongle.off.x-self.pool_dongle.r/2,self.y+self.h/2+self.pool_dongle.off.y+self.pool_dongle.r/2);

      //graph_dongle
      ctx.fillStyle = "#000000";
      //ctx.drawImage(dongle_img,self.x+self.w/2+self.graph_dongle.off.x-self.graph_dongle.r,self.y+self.h/2+self.graph_dongle.off.y-self.graph_dongle.r,self.graph_dongle.r*2,self.graph_dongle.r*2);
      if(self.graph) ctx.fillText("o",self.x+self.w/2+self.graph_dongle.off.x-self.graph_dongle.r/2,self.y+self.h/2+self.graph_dongle.off.y+self.graph_dongle.r/2);
      else           ctx.fillText("-",self.x+self.w/2+self.graph_dongle.off.x-self.graph_dongle.r/2,self.y+self.h/2+self.graph_dongle.off.y+self.graph_dongle.r/2);

      //square_dongle
      ctx.fillStyle = "#000000";
      //ctx.drawImage(dongle_img,self.x+self.w/2+self.square_dongle.off.x-self.square_dongle.r,self.y+self.h/2+self.square_dongle.off.y-self.square_dongle.r,self.square_dongle.r*2,self.square_dongle.r*2);
      if(self.square) ctx.fillText("o",self.x+self.w/2+self.square_dongle.off.x-self.square_dongle.r/2,self.y+self.h/2+self.square_dongle.off.y+self.square_dongle.r/2);
      else          ctx.fillText("-",self.x+self.w/2+self.square_dongle.off.x-self.square_dongle.r/2,self.y+self.h/2+self.square_dongle.off.y+self.square_dongle.r/2);
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

      safenormvec(self.input_dongle.off, 1,self.input_dongle.off);
      safenormvec(self.output_dongle.off,-1,self.output_dongle.off);

      mulvec(self.input_dongle.off,dongle_r,self.input_dongle.off);
      mulvec(self.output_dongle.off,dongle_r,self.output_dongle.off);

      mulvec(self.input_dongle_vel,0.9,self.input_dongle_vel);
      mulvec(self.output_dongle_vel,0.9,self.output_dongle_vel);
    }
  }

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:canv.height/canv.width*2,x:0,y:0,w:0,y:0};

    modules = [];
    dragging_obj = 0;
    full_pause = false;
    drag_pause = false;
    tick_timer = 0;
    max_tick_timer = 10;
    tick_i = 0;
    max_tick_i = 100

    load_template_i = 0;
    templates = [];
    /*empty*/            templates.push("{\"modules\":[]}");
    /*feedback loop*/    templates.push("{\"modules\":[{\"v\":0,\"min\":-10,\"max\":100,\"pool\":0,\"graph\":true,\"square\":true,\"wx\":-0.35,\"wy\":0.18749999999999994,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":0,\"min\":-10,\"max\":100,\"pool\":0,\"graph\":true,\"square\":true,\"wx\":0.1656249999999999,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":1.1,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.13124999999999998,\"wy\":0.38125,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"v\":1.1,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.13124999999999998,\"wy\":0.021874999999999978,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*normalizing loop*/ templates.push("{\"modules\":[{\"v\":55.56,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":-0.10624999999999996,\"wy\":0.06874999999999998,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":50,\"min\":-10,\"max\":100,\"pool\":0,\"graph\":true,\"square\":true,\"wx\":0.5125,\"wy\":0.09687499999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":50,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":-0.44687500000000013,\"wy\":0.43125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":-1,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":0.1875,\"wy\":0.11249999999999999,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"v\":1,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.43437499999999996,\"wy\":0.19374999999999998,\"ww\":0.15625,\"wh\":0.15625,\"input\":2,\"adder\":0},{\"v\":0.9,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":0.1968749999999999,\"wy\":-0.10312500000000002,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1}]}");
    /*cycle*/            templates.push("{\"modules\":[{\"v\":59.82,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":91.74,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":-0.3,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.078125,\"wy\":0.384375,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"v\":0.3,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"v\":10,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.6,\"wy\":0.21875,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":0},{\"v\":-10,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":1}]}");
    /*proportion cycle*/ templates.push("{\"modules\":[{\"v\":100,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":-0.31875,\"wy\":0.184375,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":50,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":true,\"square\":true,\"wx\":0.2437499999999999,\"wy\":0.175,\"ww\":0.15625,\"wh\":0.15625,\"input\":-1,\"adder\":-1},{\"v\":-0.4,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.078125,\"wy\":0.384375,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":0},{\"v\":0.1,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.050000000000000044,\"wy\":0.003124999999999989,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":1},{\"v\":0.3,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":-0.6,\"wy\":0.21875,\"ww\":0.15625,\"wh\":0.15625,\"input\":0,\"adder\":0},{\"v\":-0.2,\"min\":-10,\"max\":100,\"pool\":true,\"graph\":0,\"square\":0,\"wx\":0.48124999999999996,\"wy\":0.203125,\"ww\":0.15625,\"wh\":0.15625,\"input\":1,\"adder\":1}]}");

    s_dragger = new screen_dragger();

    add_module_btn = new btn(-0.4,0.4,0.2,0.2);
    add_module_btn.wx = -screen_cam.ww/2+add_module_btn.ww/2+0.1;
    add_module_btn.wy =  screen_cam.wh/2-add_module_btn.wh/2-0.1;
    screenSpace(screen_cam,canv,add_module_btn);
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

    var playback_btn_size = 0.1;
    pause_btn = new btn(-0.4,0.4,playback_btn_size,playback_btn_size);
    pause_btn.wx = -screen_cam.ww/2+pause_btn.ww/2+0.1;
    pause_btn.wy = -screen_cam.wh/2+pause_btn.wh/2+0.1;
    screenSpace(screen_cam,canv,pause_btn);
    pause_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,pause_btn))
        full_pause = !full_pause;
      return false;
    }

    advance_btn = new btn(-0.4,0.4,playback_btn_size,playback_btn_size);
    advance_btn.wx = -screen_cam.ww/2+advance_btn.ww/2+0.1+pause_btn.ww+0.1;
    advance_btn.wy =  pause_btn.wy;
    screenSpace(screen_cam,canv,advance_btn);
    advance_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,advance_btn))
        flow();
      return false;
    }

    speed_btn = new btn(-0.4,0.4,playback_btn_size,playback_btn_size);
    speed_btn.wx = -screen_cam.ww/2+speed_btn.ww/2+0.1+pause_btn.ww+0.1+advance_btn.ww+0.1;
    speed_btn.wy =  pause_btn.wy;
    screenSpace(screen_cam,canv,speed_btn);
    speed_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,speed_btn))
      {
        max_tick_timer--;
        if(max_tick_timer <= 0) max_tick_timer = 10;
      }
      return false;
    }

    print_btn = new btn(-0.4,0.4,0.2,0.2);
    print_btn.wx = screen_cam.ww/2-print_btn.ww/2-0.1;
    print_btn.wy = screen_cam.wh/2-print_btn.wh/2-0.1;
    screenSpace(screen_cam,canv,print_btn);
    print_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,print_btn))
        print_template();
      return false;
    }

    load_btn = new btn(-0.4,0.4,0.2,0.2);
    load_btn.wx = screen_cam.ww/2-load_btn.ww/2-0.1;
    load_btn.wy = screen_cam.wh/2-load_btn.wh/2-0.1-print_btn.wh-0.1;
    screenSpace(screen_cam,canv,load_btn);
    load_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,load_btn))
        load_next_template();
      return false;
    }

  };

  var flow = function()
  {
    tick_i++;
    if(tick_i >= max_tick_i) tick_i = 0;

    tick_timer = max_tick_timer;
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
      modules[i].plot[tick_i] = modules[i].v;
    }
  }

  self.tick = function()
  {
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].pool_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].graph_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].square_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].v_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].input_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].output_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i]);
    dragger.filter(add_module_btn);
    dragger.filter(pause_btn);
    dragger.filter(advance_btn);
    dragger.filter(speed_btn);
    dragger.filter(print_btn);
    dragger.filter(load_btn);
    dragger.filter(s_dragger);

    dragger.flush();
    clicker.flush();

    for(var i = 0; i < modules.length; i++)
      modules[i].cache_const = 1;
    for(var i = 0; i < modules.length; i++)
      if(modules[i].output_dongle.attachment) modules[i].output_dongle.attachment.cache_const = 0;

    if(!drag_pause && !full_pause)
    {
      tick_timer--;
      if(tick_timer <= 0)
        flow();
    }

    for(var i = 0; i < modules.length; i++)
      modules[i].tick();
  };

  self.draw = function()
  {
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0,0,canv.width,canv.height);

    ctx.fillStyle = "#000000";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.fillText("Add Amp",add_module_btn.x+2,add_module_btn.y+10);
    ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);
    ctx.fillText("Pause",pause_btn.x+2,pause_btn.y+10);
    ctx.strokeRect(pause_btn.x,pause_btn.y,pause_btn.w,pause_btn.h);
    ctx.fillText("Advance",advance_btn.x+2,advance_btn.y+10);
    ctx.strokeRect(advance_btn.x,advance_btn.y,advance_btn.w,advance_btn.h);
    ctx.fillText("Speed ("+max_tick_timer+")",speed_btn.x+2,speed_btn.y+10);
    ctx.strokeRect(speed_btn.x,speed_btn.y,speed_btn.w,speed_btn.h);
    ctx.fillText("Save",print_btn.x+2,print_btn.y+10);
    ctx.strokeRect(print_btn.x,print_btn.y,print_btn.w,print_btn.h);
    ctx.fillText("Load Next ("+load_template_i+"/"+(templates.length-1)+")",load_btn.x+2,load_btn.y+10);
    ctx.strokeRect(load_btn.x,load_btn.y,load_btn.w,load_btn.h);

    for(var i = 0; i < modules.length; i++)
      screenSpace(work_cam,canv,modules[i]);

    for(var i = 0; i < modules.length; i++)
      modules[i].draw_bg();
    for(var i = 0; i < modules.length; i++)
      modules[i].draw();

    if(drag_pause || full_pause)
    {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0,0,canv.width,canv.height);
    }

    //graph
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    var x = 0;
    var y = 0;

    for(var i = 0; i < modules.length; i++)
    {
      if(!modules[i].graph) continue;
      x = 0;
      y = canv.height;
      ctx.beginPath();
      if(!isNaN(modules[i].plot[0])) y = canv.height-mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[0])*100;
      ctx.moveTo(x,y);
      for(var j = 0; j < max_tick_i; j++)
      {
        if(j <= tick_i) x =  j   /(max_tick_i-1)*canv.width;
        else            x = (j-1)/(max_tick_i-1)*canv.width;
        if(!isNaN(modules[i].plot[j])) y = canv.height-mapVal(modules[i].min,modules[i].max,0,1,modules[i].plot[j])*100;
        ctx.lineTo(x,y);
      }
      ctx.stroke();
    }

    x = tick_i/(max_tick_i-1)*canv.width;
    ctx.beginPath();
    ctx.moveTo(x,canv.height-100);
    ctx.lineTo(x,canv.height);
    ctx.stroke();
  };

  self.cleanup = function()
  {
  };

};

