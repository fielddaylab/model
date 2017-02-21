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

  var add_module_btn;

  var w = 30;
  var h = 30;
  var blurb = GenIcon(w,h)
  blurb.context.fillStyle = "#FF4444";
  blurb.context.strokeStyle = "#FFFFFF";
  blurb.context.lineWidth = 3;
  blurb.context.beginPath();
  blurb.context.arc(w/2,h/2,(w-5)/2,0,2*Math.PI);
  blurb.context.fill();
  blurb.context.stroke();

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

  var module_dongle = function(offx,offy,r,module)
  {
    var self = this;
    self.module = module;
    self.off_x = offx;
    self.off_y = offy;
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return distsqr(self.module.x+self.off_x,self.module.y+self.off_y,evt.doX,evt.doY) < self.r*self.r;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
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
    }
  }
  var module_whippet_dongle = function(offx,offy,r,module)
  {
    var self = this;
    self.module = module;
    self.off_x = offx;
    self.off_y = offy;
    self.drag_start_x = 0;
    self.drag_start_y = 0;
    self.r = r;

    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return distsqr(self.module.x+self.off_x,self.module.y+self.off_y,evt.doX,evt.doY) < self.r*self.r;
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
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
      self.attachment = 0;
      for(var i = 0; i < modules.length; i++)
      {
        if(doEvtWithinBB(evt, modules[i]))
          self.attachment = modules[i];
      }
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
    self.color = "#FFFF00";
    self.damp_color = "rgba(200,200,200,0.5)";

    self.v = 0;
    self.v_temp = 0;
    self.range = 100;

    self.v_dongle = new module_dongle(5,self.h-5,10,self);
    self.v_dongle.drag = function(evt)
    {
      self.v_dongle.delta = self.v_dongle.drag_start_y-evt.doY;
      self.v_temp = clamp(0,self.range,self.v+self.v_dongle.delta);
    }
    self.v_dongle.dragFinish = function(evt)
    {
      if(dragging_obj == self.v_dongle) dragging_obj = 0;
      self.v = self.v_temp;
    }

    self.range_dongle = new module_dongle(0,0,0,self);

    self.adder_dongle = new module_whippet_dongle(self.w,5,10,self);
    self.subtractor_dongle = new module_whippet_dongle(self.w,self.h-5,10,self);

    //the module itself
    self.shouldDrag = function(evt)
    {
      if(dragging_obj && dragging_obj != self) return false;
      return doEvtWithinBB(evt,self);
    }
    self.dragStart = function(evt)
    {
      dragging_obj = self;
      self.off_x = evt.doX-self.x;
      self.off_y = evt.doY-self.y;
    }
    self.drag = function(evt)
    {
      self.x = evt.doX-self.off_x;
      self.y = evt.doY-self.off_y;
      worldSpaceCoords(work_cam,canv,self);
    }
    self.dragFinish = function(evt)
    {
      if(dragging_obj == self) dragging_obj = 0;
    }

    self.draw = function()
    {
      //title
      ctx.fillStyle = "#000000";
      ctx.fillText(self.title,self.x,self.y-10);

      //adder_dongle
      ctx.drawImage(blurb,self.x+self.adder_dongle.off_x-self.adder_dongle.r,self.y+self.adder_dongle.off_y-self.adder_dongle.r,self.adder_dongle.r*2,self.adder_dongle.r*2);
      ctx.fillStyle = "#000000";
      ctx.fillText("+",self.x+self.adder_dongle.off_x+self.adder_dongle.r/2,self.y+self.adder_dongle.off_y+self.adder_dongle.r/2);

      //subtractor_dongle
      ctx.drawImage(blurb,self.x+self.subtractor_dongle.off_x-self.subtractor_dongle.r,self.y+self.subtractor_dongle.off_y-self.subtractor_dongle.r,self.subtractor_dongle.r*2,self.subtractor_dongle.r*2);
      ctx.fillStyle = "#000000";
      ctx.fillText("-",self.x+self.subtractor_dongle.off_x+self.subtractor_dongle.r/2,self.y+self.subtractor_dongle.off_y+self.subtractor_dongle.r/2);

      //fill
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
      ctx.fillStyle = "#000000"
      ctx.drawImage(blurb,self.x+self.v_dongle.off_x-self.v_dongle.r,self.y+self.v_dongle.off_y-self.v_dongle.r,self.v_dongle.r*2,self.v_dongle.r*2);
      if(self.v_dongle.dragging) ctx.fillText(self.v_temp,self.x+self.v_dongle.off_x-self.v_dongle.r/2,self.y+self.v_dongle.off_y+self.v_dongle.r/2);
      else                       ctx.fillText(self.v     ,self.x+self.v_dongle.off_x-self.v_dongle.r/2,self.y+self.v_dongle.off_y+self.v_dongle.r/2);

      //adder_dongle_line
      ctx.strokeStyle = "#000000"
      if(self.adder_dongle.dragging)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.adder_dongle.off_x,self.y+self.adder_dongle.off_y);
        ctx.lineTo(self.adder_dongle.drag_x,self.adder_dongle.drag_y);
        ctx.stroke();
      }
      else if(self.adder_dongle.attachment)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.adder_dongle.off_x,self.y+self.adder_dongle.off_y);
        ctx.lineTo(self.adder_dongle.attachment.x+self.adder_dongle.attachment.w/2,self.adder_dongle.attachment.y+self.adder_dongle.attachment.h/2);
        ctx.stroke();
      }

      //subtractor_dongle_line
      ctx.strokeStyle = "#000000"
      if(self.subtractor_dongle.dragging)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.subtractor_dongle.off_x,self.y+self.subtractor_dongle.off_y);
        ctx.lineTo(self.subtractor_dongle.drag_x,self.subtractor_dongle.drag_y);
        ctx.stroke();
      }
      else if(self.subtractor_dongle.attachment)
      {
        ctx.beginPath();
        ctx.moveTo(self.x+self.subtractor_dongle.off_x,self.y+self.subtractor_dongle.off_y);
        ctx.lineTo(self.subtractor_dongle.attachment.x+self.subtractor_dongle.attachment.w/2,self.subtractor_dongle.attachment.y+self.subtractor_dongle.attachment.h/2);
        ctx.stroke();
      }

    }

  }

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};

    modules = [];
    dragging_obj = 0;

    add_module_btn = new btn(-0.4,0.4,0.2,0.2);
    add_module_btn.wx = -screen_cam.ww/2+add_module_btn.ww/2+0.1;
    add_module_btn.wy =  screen_cam.wh/2-add_module_btn.wh/2-0.1;
    screenSpace(screen_cam,canv,add_module_btn);
    add_module_btn.shouldDrag = function(evt)
    {
      if(dragging_obj) return false;
      if(doEvtWithinBB(evt,add_module_btn))
      {
        var m = new module(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),0.1,0.1);
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        modules.push(m);
      }
      return false;
    }

  };

  self.tick = function()
  {
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].v_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].adder_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i].subtractor_dongle);
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i]);
    dragger.filter(add_module_btn);

    dragger.flush();
    clicker.flush();
  };

  self.draw = function()
  {
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(0,0,canv.width,canv.height);

    ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);
    for(var i = 0; i < modules.length; i++)
      modules[i].draw();
  };

  self.cleanup = function()
  {
  };

};

