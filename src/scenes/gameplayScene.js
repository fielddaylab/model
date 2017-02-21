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
  var dragging_module;

  var add_module_btn;

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

    self.v = 0;
    self.range = 0;

    self.shouldDrag = function(evt)
    {
      if(dragging_module && dragging_module != self) return false;
      return doEvtWithinBB(evt,self);
    }
    self.dragStart = function(evt)
    {
      dragging_module = self;
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
      if(dragging_module == self) dragging_module = 0;
    }
  }

  self.ready = function()
  {
    dragger = new Dragger({source:stage.dispCanv.canvas});
    clicker = new Clicker({source:stage.dispCanv.canvas});

    screen_cam = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};
    work_cam   = {wx:0,wy:0,ww:2,wh:1,x:0,y:0,w:0,y:0};

    modules = [];
    dragging_module = 0;

    add_module_btn = new btn(-0.4,0.4,0.2,0.2);
    add_module_btn.shouldDrag = function(evt)
    {
      if(dragging_module) return false;
      if(doEvtWithinBB(evt,add_module_btn))
      {
        var m = new module(worldSpaceX(work_cam,canv,evt.doX),worldSpaceY(work_cam,canv,evt.doY),0.1,0.1);
        screenSpace(work_cam,canv,m);

        if(m.shouldDrag(evt)) { m.dragStart(evt); m.dragging = true; }
        modules.push(m);
      }
      return false;
    }

    screenSpace(screen_cam,canv,add_module_btn);
  };

  self.tick = function()
  {
    for(var i = 0; i < modules.length; i++)
      dragger.filter(modules[i]);
    dragger.filter(add_module_btn);

    dragger.flush();
    clicker.flush();

    ctx.strokeRect(add_module_btn.x,add_module_btn.y,add_module_btn.w,add_module_btn.h);
    for(var i = 0; i < modules.length; i++)
    {
      ctx.strokeRect(modules[i].x,modules[i].y,modules[i].w,modules[i].h);
    }
  };

  self.draw = function()
  {
  };

  self.cleanup = function()
  {
  };

};

