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

  var pools;
  var modules;
  var dragging_obj;
  var ticking;
  var tick_timer;

  var add_pool_btn;
  var add_module_btn;

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
      if(dragging_obj && dragging_obj != self) return false;
      return distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.w/2+self.off.y,evt.doX,evt.doY) < self.r*self.r;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      ticking = false;
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
      ticking = true;
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

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return distsqr(self.src.x+self.src.w/2+self.off.x,self.src.y+self.src.h/2+self.off.y,evt.doX,evt.doY) < self.r*self.r;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      ticking = false;
      self.drag_start_x = evt.doX;
      self.drag_start_y = evt.doY;
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
    }
    self.drag = function(evt)
    {
      self.drag_x = evt.doX;
      self.drag_y = evt.doY;
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self) dragging_obj = 0;
      ticking = true;
      self.attachment = 0;
      for(var i = 0; i < modules.length; i++)
      {
        if(doEvtWithinBB(evt, modules[i]))
          self.attachment = modules[i];
      }
      for(var i = 0; i < pools.length; i++)
      {
        if(doEvtWithinBB(evt, pools[i]))
          self.attachment = pools[i];
      }
    }
  }

  var pool = function(wx,wy,ww,wh)
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
    self.color = "#FFFF00";
    self.damp_color = "rgba(200,200,200,0.5)";

    self.v = 0;
    self.v_temp = 0;
    self.range = 100;

    self.v_dongle = new dongle(0,0,dongle_img.width/2,self);
    self.v_dongle.drag = function(evt)
    {
      self.v_dongle.delta = self.v_dongle.drag_start_y-evt.doY;
      self.v_temp = clamp(0,self.range,self.v+self.v_dongle.delta);
    }
    self.v_dongle.dragFinish = function(evt)
    {
      if(dragging_obj == self.v_dongle) dragging_obj = 0;
      ticking = true;
      self.v = self.v_temp;
    }

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

    self.draw = function()
    {
      //title
      //ctx.fillStyle = "#000000";
      //ctx.fillText(self.title,self.x,self.y-10);

      //fill
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(self.x,self.y,self.w,self.h);
      ctx.fillStyle = self.color;
      var p = self.v/self.range;
      ctx.fillRect(self.x,self.y+self.h*(1-p),self.w,self.h*p);
      if(self.v_dongle.dragging)
      {
        ctx.fillStyle = self.damp_color;
        var p = self.v_temp/self.range;
        ctx.fillRect(self.x,self.y+self.h*(1-p),self.w,self.h*p);
      }

      //stroke
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(self.x,self.y,self.w,self.h);

      //v_dongle
      ctx.fillStyle = "#000000";
      ctx.drawImage(dongle_img,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r,self.y+self.h/2+self.v_dongle.off.y-self.v_dongle.r,self.v_dongle.r*2,self.v_dongle.r*2);
      if(self.v_dongle.dragging) ctx.fillText(self.v_temp,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);
      else                       ctx.fillText(self.v     ,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);

    }

  }

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
    self.range = 10;

    self.v_dongle = new dongle(0,0,dongle_img.width/2,self);
    self.v_dongle.drag = function(evt)
    {
      self.v_dongle.delta = (self.v_dongle.drag_start_y-evt.doY)/10;
      self.v_temp = clamp(-self.range,self.range,self.v+self.v_dongle.delta);
    }
    self.v_dongle.dragFinish = function(evt)
    {
      if(dragging_obj == self.v_dongle) dragging_obj = 0;
      ticking = true;
      self.v = self.v_temp;
    }

    self.input_dongle_vel = {x:0,y:0};
    self.adder_dongle_vel = {x:0,y:0};

    self.input_dongle = new whippet_dongle( self.w,0,dongle_img.width/2,self);
    self.adder_dongle = new whippet_dongle(-self.w,0,dongle_img.width/2,self);

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

      //adder_dongle_line
      ctx.strokeStyle = "#000000"
      if(self.adder_dongle.dragging)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.adder_dongle.off.x,self.y+self.h/2+self.adder_dongle.off.y);
        ctx.lineTo(self.adder_dongle.drag_x,self.adder_dongle.drag_y);
        ctx.stroke();
      }
      else if(self.adder_dongle.attachment)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.adder_dongle.off.x,self.y+self.h/2+self.adder_dongle.off.y);
        ctx.lineTo(self.adder_dongle.attachment.x+self.adder_dongle.attachment.w/2,self.adder_dongle.attachment.y+self.adder_dongle.attachment.h/2);
        ctx.stroke();
      }
    }

    self.draw = function()
    {
      //title
      //ctx.fillStyle = "#000000";
      //ctx.fillText(self.title,self.x,self.y-10);

      ctx.drawImage(module_img,self.x,self.y,self.w,self.h);

      //input_dongle
      ctx.strokeStyle = "#668866";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
      ctx.lineTo(self.x+self.w/2+self.input_dongle.off.x,self.y+self.h/2+self.input_dongle.off.y);
      ctx.stroke();
      ctx.drawImage(dongle_img,self.x+self.w/2+self.input_dongle.off.x-self.input_dongle.r,self.y+self.h/2+self.input_dongle.off.y-self.input_dongle.r,self.input_dongle.r*2,self.input_dongle.r*2);

      //adder_dongle
      ctx.lineWidth = abs(self.v/self.range)*dongle_img.width/2;
      if(self.v > 0)
        ctx.strokeStyle = "#6666FF";
      else if(self.v < 0)
        ctx.strokeStyle = "#FF6666";
      if(self.v != 0)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.w/2+self.v_dongle.off.x,    self.y+self.h/2+self.v_dongle.off.y);
        ctx.lineTo(self.x+self.w/2+self.adder_dongle.off.x,self.y+self.h/2+self.adder_dongle.off.y);
        ctx.stroke();
      }

      if(self.v_dongle.dragging)
      {
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = abs(self.v_temp/self.range)*dongle_img.width/2;
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
          ctx.lineTo(self.x+self.w/2+self.adder_dongle.off.x,self.y+self.h/2+self.adder_dongle.off.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.;
      }
      ctx.drawImage(dongle_img,self.x+self.w/2+self.adder_dongle.off.x-self.adder_dongle.r,self.y+self.h/2+self.adder_dongle.off.y-self.adder_dongle.r,self.adder_dongle.r*2,self.adder_dongle.r*2);

      //fill
      /*
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(self.x,self.y,self.w,self.h);
      ctx.fillStyle = self.color;
      var p = self.v/self.range;
      if(p > 0) ctx.fillRect(self.x,self.y+((self.h*(1-p))/2),self.w,(self.h* p)/2);
      else      ctx.fillRect(self.x,self.y+  self.h       /2 ,self.w,(self.h*-p)/2);
      if(self.v_dongle.dragging)
      {
        ctx.fillStyle = self.damp_color;
        var p = self.v_temp/self.range;
        if(p > 0) ctx.fillRect(self.x,self.y+((self.h*(1-p))/2),self.w,(self.h* p)/2);
        else      ctx.fillRect(self.x,self.y+  self.h       /2 ,self.w,(self.h*-p)/2);
      }

      //stroke
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(self.x,self.y,self.w,self.h);
      */

      //v_dongle
      ctx.drawImage(dongle_img,self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r,self.y+self.h/2+self.v_dongle.off.y-self.v_dongle.r,self.v_dongle.r*2,self.v_dongle.r*2);
      ctx.fillStyle = "#000000"
      if(self.v_dongle.dragging) ctx.fillText(fdisp(self.v_temp,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);
      else                       ctx.fillText(fdisp(self.v     ,2),self.x+self.w/2+self.v_dongle.off.x-self.v_dongle.r/2,self.y+self.h/2+self.v_dongle.off.y+self.v_dongle.r/2);
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
      normvec(self.adder_dongle.off,self.adder_dongle.off);
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
      if(self.adder_dongle.attachment || self.adder_dongle.dragging)
      {
        if(self.adder_dongle.attachment)
        {
          target.x = self.adder_dongle.attachment.x+self.adder_dongle.attachment.w/2;
          target.y = self.adder_dongle.attachment.y+self.adder_dongle.attachment.h/2;
        }
        else if(self.adder_dongle.dragging)
        {
          target.x = self.adder_dongle.drag_x;
          target.y = self.adder_dongle.drag_y;
        }
        from.x = self.x+self.w/2+self.adder_dongle.off.x;
        from.y = self.y+self.h/2+self.adder_dongle.off.y;
        subvec(target,from,vel);
        safenormvec(vel,-1,vel);
        mulvec(vel,0.5,vel);
        addvec(self.adder_dongle_vel,vel,self.adder_dongle_vel);
      }
      addvec(self.input_dongle.off,self.input_dongle_vel,self.input_dongle.off);
      addvec(self.adder_dongle.off,self.adder_dongle_vel,self.adder_dongle.off);
      normvec(self.input_dongle.off,self.input_dongle.off);
      normvec(self.adder_dongle.off,self.adder_dongle.off);

      avevec(self.input_dongle.off,self.adder_dongle.off,ave);

      subvec(self.input_dongle.off,ave,self.input_dongle.off);
      subvec(self.adder_dongle.off,ave,self.adder_dongle.off);

      safenormvec(self.input_dongle.off, 1,self.input_dongle.off);
      safenormvec(self.adder_dongle.off,-1,self.adder_dongle.off);

      mulvec(self.input_dongle.off,dongle_r,self.input_dongle.off);
      mulvec(self.adder_dongle.off,dongle_r,self.adder_dongle.off);

      mulvec(self.input_dongle_vel,0.9,self.input_dongle_vel);
      mulvec(self.adder_dongle_vel,0.9,self.adder_dongle_vel);
    }
  }

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};

    pools = [];
    modules = [];
    dragging_obj = 0;
    ticking = true;

    add_pool_btn = new btn(-0.4,0.4,0.2,0.2);
    add_pool_btn.wx = -screen_cam.ww/2+add_pool_btn.ww/2+0.1;
    add_pool_btn.wy =  screen_cam.wh/2-add_pool_btn.wh/2-0.1;
    screenSpace(screen_cam,canv,add_pool_btn);
    add_pool_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,add_pool_btn))
      {
        var m = new pool(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),0.1,0.1);
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        pools.push(m);
      }
      return false;
    }

    add_module_btn = new btn(-0.4,0.4,0.2,0.2);
    add_module_btn.wx = -screen_cam.ww/2+add_module_btn.ww/2+0.1;
    add_module_btn.wy =  screen_cam.wh/2-add_module_btn.wh/2-0.1-add_pool_btn.wh-0.1;
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

  };

  self.tick = function()
  {
    for(var i = 0; i < pools.length; i++)
      dragger.filter(pools[i].v_dongle);
    for(var i = 0; i < pools.length; i++)
      dragger.filter(pools[i]);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].v_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].input_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].adder_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i]);
    dragger.filter(add_pool_btn);
    dragger.filter(add_module_btn);

    dragger.flush();
    clicker.flush();

    if(ticking)
    {
      tick_timer--;
      if(tick_timer <= 0)
      {
        tick_timer = 10;
        for(var i = 0; i < pools.length; i++)
          pools[i].v_temp = pools[i].v;
        for(var i = 0; i < modules.length; i++)
          modules[i].v_temp = modules[i].v;

        for(var i = 0; i < modules.length; i++)
        {
          if(modules[i].input_dongle.attachment && modules[i].adder_dongle.attachment)
            modules[i].adder_dongle.attachment.v_temp += modules[i].input_dongle.attachment.v*(modules[i].v);
        }

        for(var i = 0; i < pools.length; i++)
        {
          pools[i].v_temp = fdisp(clamp(0,pools[i].range,pools[i].v_temp),2);
          pools[i].v = pools[i].v_temp;
        }
        for(var i = 0; i < modules.length; i++)
        {
          modules[i].v_temp = fdisp(clamp(-modules[i].range,modules[i].range,modules[i].v_temp),2);
          modules[i].v = modules[i].v_temp;
        }
      }
    }

    for(var i = 0; i < modules.length; i++)
      modules[i].tick();
  };

  self.draw = function()
  {
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0,0,canv.width,canv.height);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.strokeRect(add_pool_btn.x,add_pool_btn.y,add_pool_btn.w,add_pool_btn.h);
    ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);

    for(var i = 0; i < modules.length; i++)
      modules[i].draw_bg();
    for(var i = 0; i < pools.length; i++)
      pools[i].draw();
    for(var i = 0; i < modules.length; i++)
      modules[i].draw();

    if(!ticking)
    {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0,0,canv.width,canv.height);
    }
  };

  self.cleanup = function()
  {
  };

};

