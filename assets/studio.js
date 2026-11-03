
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  if (!$("production")) return;
  var STORAGE = "abu_alfaisal_production_v2";
  var NEGATIVE = "ممنوع الغروب، الحقائب، خرائط السفر، دبابيس الخرائط، بوابات الصعود، نافذة الطائرة، الأوراق المكتبية المتناثرة، المسافر المصور من الخلف، الوجوه المشوهة، الخلفيات المحروقة، الشعارات المزيفة، الكتابة غير المقروءة.";
  var IDENTITY = "أبو الفيصل للسفريات والسياحة، عدن، اليمن. الهوية: كحلي داكن، بنفسجي عميق، ذهبي وأبيض. وجوه عربية يمنية محتشمة، حركات طبيعية، إضاءة نهارية محايدة، تفاصيل فوتوغرافية واقعية، الحفاظ على الوجه والملابس والموقع بين المشاهد.";
  var STYLES = {
    cinematic: "واقعي سينمائي راقٍ؛ حركة كاميرا محسوبة وعدسات طبيعية ولقطات قريبة مع إيقاع متزن.",
    emotional: "إنساني دافئ بلا مبالغة درامية؛ تعبيرات صادقة وحركة هادئة وإيقاع يتصاعد.",
    documentary: "واقعي وثائقي يشبه إعلانًا مصورًا داخل وكالة حقيقية؛ مونتاج نظيف وكاميرا ثابتة أو حركة خفيفة.",
    dynamic: "إيقاع إعلاني سريع وذكي؛ تبديل زوايا محسوب مع الحفاظ على قصة مفهومة، دون مؤثرات مزعجة."
  };
  var PLATFORMS = { reels: "Instagram Reels", tiktok: "TikTok", stories: "Stories" };
  var GOALS = { trust: "تعزيز الثقة", leads: "زيادة الاستفسارات", engagement: "زيادة إكمال المشاهدة" };
  var PRESETS = {
    flights: {
      title: "قبل ما يفوت الموعد",
      hook: "وجد سعرًا مناسبًا... لكن شيئًا واحدًا غيّر اختياره.",
      problem: "قد يختلف وقت الوصول المناسب عن السعر الأقل.",
      action: "الوكالة تراجع الوقت والتوقف والوزن وشروط التذكرة قبل الاختيار.",
      result: "المسافر يختار بناءً على موعده الحقيقي ومعرفة التفاصيل.",
      character: "رجل يمني في أوائل الثلاثينيات، بشرة قمحية، شعر أسود قصير، لحية مرتبة، قميص بيج وسترة كحلية؛ حافظ على هذه الهيئة بالضبط.",
      scenes: [
        ["رجل يمني يجلس قرب طاولة في منزله نهارًا، وينظر إلى تذكير بموعد عائلي مهم على هاتفه. تظهر عليه رغبة الوصول في الوقت المحدد.", "في موعد ما يتعوّض", "لقطة متوسطة إلى مقربة على تعبير الوجه وحركة اليد، انتقال قطعي."],
        ["على شاشة هاتف غير مقروءة التفاصيل يقارن الرجل رحلتين، ويدرك أن خيارًا يصل بعد الموعد المطلوب، فيتوقف عن الاختيار.", "السعر وحده مش كفاية", "لقطة فوق الكتف بزاوية جانبية تكشف رد الفعل لا محتوى الهاتف، انتقال مباشر."],
        ["موظف يمني في مكتب سفريات معاصر بألوان كحلية وذهبية يشير على شاشة عامة إلى فرق توقيت الوصول والوزن ومدة التوقف.", "التوقيت والوزن والتوقف", "لقطة ثنائية من الأمام ثم قرب تعبيرات العميل والموظف؛ نفس الملابس والموقع."],
        ["الرجل يتلقى ملخص رحلة مناسبًا لموعده، تتبدل ملامحه إلى ارتياح طبيعي. تتحول آخر ثانيتين إلى بطاقة العلامة.", "أبو الفيصل للسفريات والسياحة", "حركة تقرّب هادئة على العميل ثم قطع نظيف إلى بطاقة ختامية كحلية."]
      ]
    },
    students: {
      title: "الدقيقة التي سبقت المحاضرة",
      hook: "قبول الدراسة جاهز... لكن يوم الوصول قد يغيّر كل شيء.",
      problem: "قد يصل الطالب بعد الموعد الدراسي المطلوب إذا اختار الرحلة من السعر وحده.",
      action: "تُراجع الوكالة مواعيد الوصول والترانزيت وفق خطة الطالب.",
      result: "يفهم الطالب الخيارات المناسبة ويختار مساره عن معرفة.",
      character: "طالب يمني في أوائل العشرينيات، شعر أسود قصير، قميص أزرق فاتح، دون تغيير ملامح أو ملابس بين المشاهد.",
      scenes: [
        ["طالب يمني أمام حاسوبه في غرفة مشرقة، يضع على التقويم موعد أول محاضرة، ويلاحظ قرب التاريخ.", "أول محاضرة لها موعد", "لقطة أمامية للشخص مع انتقال ليد تشير إلى التقويم بلا نص صغير مقروء."],
        ["يعرض هاتف الطالب خيارات سفر مبهمة التفاصيل؛ يتوقف لأنه لاحظ وصولًا متأخرًا بالنسبة لموعد الدراسة.", "ووقت الوصول يفرق", "تقريب هادئ لرد فعله لا للبيانات الظاهرة على الشاشة."],
        ["موظف في وكالة أبو الفيصل يراجع مع الطالب توقيت الوصول والربط بين الرحلات، بطريقة مباشرة وواضحة.", "نراجع التوقيت والمسار", "لقطة جانبية بمستوى العين ثم إلى وجه الطالب؛ مكتب عصري وإضاءة نهارية."],
        ["الطالب يستوعب الخيارات، يثبت الموعد على تقويمه بابتسامة بسيطة، ثم بطاقة هوية المكتب.", "أبو الفيصل للسفريات والسياحة", "لقطة نتيجة قصيرة ثم انتقال إلى بطاقة ختامية ثابتة."]
      ]
    },
    visa: {
      title: "السؤال قبل التذكرة",
      hook: "كان مستعدًا للحجز... ثم اكتشف السؤال الأهم.",
      problem: "تختلف متطلبات الدخول باختلاف الجنسية والوجهة والظروف.",
      action: "يبدأ العميل بمراجعة الوثائق والمتطلبات الرسمية قبل الالتزام بتذكرة.",
      result: "يتخذ قرار السفر بعد التحقق، دون وعود بصدور تأشيرة.",
      character: "رجل يمني أوائل الثلاثينيات، قميص رمادي فاتح، شعر أسود قصير، لحية خفيفة، نفس الهيئة في كل لقطة.",
      scenes: [
        ["رجل يمني يجلس في منزله نهارًا ويهم باختيار رحلة على هاتفه، لكنه يتوقف قليلًا ليفكر في إجراءات الدخول.", "قبل اختيار الرحلة...", "لقطة نصف قريبة لليد المتوقفة، والإضاءة مريحة دون شاشة مقروءة."],
        ["ينظر الرجل إلى جواز سفر مغلق موضوع بشكل بسيط قربه، وتظهر عليه الحاجة لسؤال عن المتطلبات.", "راجعت متطلبات الدخول؟", "لقطة وجه وجواز دون إظهار أرقام أو بيانات حقيقية."],
        ["موظف سفريات يشرح للعميل ضرورة التحقق من المتطلبات الرسمية والوثائق بحسب الوجهة والجنسية.", "التحقق أولًا... ثم القرار", "كاميرا ثابتة عند مستوى العين ولقطة توضح الحوار بصريًا دون صوت."],
        ["العميل يعيد ترتيب خطته على أساس معلومة أوضح، وتنتهي الصورة ببطاقة المكتب.", "أبو الفيصل للسفريات والسياحة", "لقطة قرار هادئة ثم بطاقة العلامة."]
      ]
    },
    followup: {
      title: "من أين جاء الخبر؟",
      hook: "وصلته رسالة عن رحلته... لكن المصدر لم يكن واضحًا.",
      problem: "المعلومة غير المؤكدة قد تربك قرار المسافر.",
      action: "يُراجع الموظف مستجدات الحجز من جهة التشغيل قبل تقديم الخيارات.",
      result: "يعرف العميل المعلومة المؤكدة والخطوة التالية عند الحاجة.",
      character: "رجل يمني في الثلاثينيات، بشرة قمحية، قميص أبيض بسيط، شعر داكن قصير، ملامح ثابتة.",
      scenes: [
        ["رجل يمني يتلقى رسالة عامة غير مقروءة على هاتفه وهو جالس في مجلس منزلي نهاري، وتبدو عليه الحيرة.", "وصل خبر عن الرحلة؟", "لقطة مقربة للوجه ثم للهاتف دون عرض رسالة حقيقية."],
        ["يمتنع عن اتخاذ قرار فوري ويختار التحقق من المصدر الصحيح.", "مش كل رسالة مؤكدة", "تثبيت الكاميرا للحظة التريث، انتقال نظيف."],
        ["موظف في مكتب أبو الفيصل يراجع حالة الحجز من مصدر الشركة ويشرح للعميل ما تأكد فعلاً فقط.", "نراجع المعلومة من مصدرها", "لقطة مكتب واضحة دون إظهار بيانات حجوزات حقيقية."],
        ["العميل يفهم الخطوة التالية ويضع هاتفه بهدوء، ثم بطاقة المكتب.", "أبو الفيصل للسفريات والسياحة", "لقطة رد فعل بسيط ثم هوية ختامية."]
      ]
    },
    umrah: {
      title: "موعد يجمع الأسرة",
      hook: "كل فرد عنده موعد مختلف... كيف يجتمعون على رحلة واحدة؟",
      problem: "اختلاف مواعيد أفراد الأسرة يعقّد تنسيق رحلة العمرة.",
      action: "تُراجع خيارات السفر وبرنامج العمرة ومتطلباته مع الأسرة.",
      result: "يتفق أفراد الأسرة على خطة أولية مناسبة دون ضمانات غير مؤكدة.",
      character: "أسرة يمنية محتشمة: أب أربعيني بقميص أبيض، أم بحجاب كحلي غير لافت، وابن شاب بقميص بيج؛ نفس الأشخاص والملابس طوال الإعلان.",
      scenes: [
        ["أسرة يمنية محتشمة تجلس في غرفة منزلية مضاءة نهارًا وتتبادل النظر حول موعد العمرة المناسب للجميع.", "كل واحد وموعده", "لقطة واسعة متزنة من الأمام مع تعبيرات دافئة غير مبالغ فيها."],
        ["الأب يشير إلى تقويم عام، والابن يلاحظ تعارضًا في المواعيد دون أوراق متراكمة أو شاشة مقروءة.", "وموعد يجمعنا؟", "لقطة يد وتقويم ثم وجوه الأسرة."],
        ["موظف أبو الفيصل يوضح الخيارات المتاحة وشروطها للأسرة داخل مكتب عصري مرتب.", "نقارن الخيارات معكم", "لقطة مكتب محايدة، تفاعل عائلي مهذب ومحتشم."],
        ["تتفق الأسرة على خطة أولية، ويظهر الارتياح الطبيعي، ثم بطاقة المكتب.", "أبو الفيصل للسفريات والسياحة", "لقطة عائلية نهارية ثم بطاقة ختامية."]
      ]
    },
    medical: {
      title: "الموعد الذي لا يحتمل التأخير",
      hook: "رحلة علاج... وتاريخ الوصول جزء من الخطة.",
      problem: "تحتاج رحلة العلاج إلى تنسيق دقيق لموعد السفر والوصول.",
      action: "تُراجع الوكالة مواعيد الرحلات ومتطلبات السفر وفق ما يقدمه العميل من تفاصيل.",
      result: "يحصل المسافر على تصور أوضح لخيارات الوصول دون وعود علاجية.",
      character: "رجل يمني في الثلاثينيات، قميص أزرق رمادي، شعر قصير ولحية خفيفة؛ يُظهر هدوءًا واحترامًا دون تصوير مرض أو ألم.",
      scenes: [
        ["رجل يمني يجلس مع أحد أفراد أسرته في منزل نهاري، يشير إلى موعد طبي على تقويم هاتفه دون إظهار معلومات صحية.", "موعد الوصول مهم", "لقطة أمامية محترمة، لا تصوير لأعراض أو ملفات طبية."],
        ["يقارن الرجل خيارين للسفر ويلاحظ فرق يوم الوصول على جدول الرحلة.", "اختيار الرحلة يحتاج تدقيق", "انتقال سلس بين الوجه والهاتف دون نص مقروء."],
        ["موظف وكالة أبو الفيصل يوضح مواعيد الوصول والتوقفات والمتطلبات اللوجستية المتاحة.", "نوضح المسار والتوقيت", "لقطة مكتب متوازنة بملامح يمنية واقعية."],
        ["يتفق الرجل والأسرة على الخيار الأنسب للتوقيت، مع بطاقة مكتب في آخر ثانيتين.", "أبو الفيصل للسفريات والسياحة", "لقطة ارتياح طبيعي ثم بطاقة ختامية."]
      ]
    }
  };

  var state = null;
  var dirty = false;
  function escapeHTML(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c];
    });
  }
  function fields() {
    return {
      service: $("p-service").value,
      duration: Number($("p-duration").value),
      style: $("p-style").value,
      platform: $("p-platform").value,
      goal: $("p-goal").value,
      brief: $("p-brief").value.trim(),
      cta: $("p-cta").value.trim(),
      title: $("p-title").value.trim()
    };
  }
  function fillForm(c) {
    ["service","duration","style","platform","goal"].forEach(function (k) {
      if ($("p-"+k).querySelector('option[value="'+c[k]+'"]')) $("p-"+k).value = String(c[k]);
    });
    ["brief","cta","title"].forEach(function (k) { $("p-"+k).value = String(c[k] || ""); });
  }
  function getTimeline(duration) {
    var bounds = [0,Math.round(duration*.18),Math.round(duration*.42),Math.round(duration*.74),duration];
    return bounds.slice(0,4).map(function (x,i) { return {start:x,end:bounds[i+1]}; });
  }
  function buildNew() {
    var c = fields();
    var t = PRESETS[c.service] || PRESETS.flights;
    var timeline = getTimeline(c.duration);
    if (!c.title) {
      c.title = t.title;
      $("p-title").value = c.title;
    }
    state = {
      config: c,
      title: c.title,
      hook: t.hook,
      problem: t.problem,
      action: t.action,
      result: t.result,
      character: t.character,
      scenes: t.scenes.map(function (s,i) {
        return { visual:s[0], overlay:s[1], camera:s[2], start:timeline[i].start,end:timeline[i].end };
      })
    };
    dirty = false;
    draw();
    saveDraft(false);
  }
  function sync() {
    if (!state) return;
    state.config = fields();
    state.title = state.config.title || PRESETS[state.config.service].title;
    var timeline = getTimeline(state.config.duration);
    state.scenes.forEach(function (s,i) { s.start=timeline[i].start;s.end=timeline[i].end; });
    drawHeader();
    updateAllPrompts();
  }
  function drawHeader() {
    if (!state) return;
    $("p-preview-title").textContent=state.title;
    $("p-preview-hook").textContent=state.hook;
    $("p-preview-flow").textContent="المشكلة: "+state.problem+"\nالحل: "+state.action+"\nالنتيجة: "+state.result;
    $("p-preview-duration").textContent=state.config.duration+" ثانية";
    $("p-preview-goal").textContent=GOALS[state.config.goal]||GOALS.trust;
    $("p-preview-platform").textContent=PLATFORMS[state.config.platform]||"Reels";
    $("p-scene-count").textContent=state.scenes.length+" مشاهد مترابطة";
    $("p-end-cta").textContent=state.config.cta || "أرسل وجهتك وموعدك لنوضح لك الخيارات";
    $("p-end-duration").textContent="آخر ثانيتين ضمن المشهد الأخير";
    state.scenes.forEach(function(s,i){
      var el=document.querySelector('[data-scene-time="'+i+'"]');
      if (el) el.textContent=s.start+"–"+s.end+" ثانية";
    });
  }
  function imagePrompt(i) {
    var s=state.scenes[i];
    return "أنت مصور إعلانات محترف. أنشئ صورة فوتوغرافية واقعية عمودية 9:16 للمشهد "+(i+1)+" من إعلان بعنوان «"+state.title+"» لصالح «أبو الفيصل للسفريات والسياحة».\n"+
      "وصف المشهد: "+s.visual+"\n"+
      "الشخصيات واستمرارية المظهر: "+state.character+"\n"+
      "تكوين اللقطة: "+s.camera+"\n"+
      "الأسلوب البصري: "+STYLES[state.config.style]+"\n"+
      "الهوية المرجعية: "+IDENTITY+"\n"+
      (state.config.brief?"توجيه إضافي: "+state.config.brief+"\n":"")+
      "تجنب إدراج أي نص داخل الصورة، لأن العبارات ستضاف بشكل صحيح في المونتاج. لا تغير وجه الشخصية بين اللقطات. صورة واحدة فقط، بلا تقسيم شاشة.\n"+
      "قيود سلبية: "+NEGATIVE;
  }
  function videoPrompt(i) {
    var s=state.scenes[i];
    return "أنشئ مقطع فيديو إعلاني مستقلًا للمشهد "+(i+1)+" من أصل "+state.scenes.length+"، مدته "+(s.end-s.start)+" ثوانٍ، عمودي 9:16، واقعي فوتوغرافي، 30 إطارًا/ثانية.\n"+
      "الحدث: "+s.visual+"\n"+
      "توجيه الكاميرا والحركة: "+s.camera+"\n"+
      "ثبات الشخصية والملابس: "+state.character+"\n"+
      "الأسلوب: "+STYLES[state.config.style]+"\n"+
      "الهوية: "+IDENTITY+"\n"+
      "الموسيقى فقط بلا تعليق صوتي ولا حوار. حركة بشرية طبيعية، انتقال واضح للحدث التالي، دون نصوص مولدة داخل الصورة.\n"+
      "العبارة التي ستضاف يدويًا بالمونتاج: «"+s.overlay+"».\n"+
      (i===state.scenes.length-1?"آخر ثانيتين: قطع إلى بطاقة ختامية كحلية تحمل اسم المكتب ومعلومة التواصل، تُصمم في المونتاج لا عبر نص مولد داخل الفيديو.\n":"")+
      (state.config.brief?"ملاحظة من صاحب المشروع: "+state.config.brief+"\n":"")+
      "تجنب: "+NEGATIVE;
  }
  function draw() {
    if (!state) return;
    $("p-shot-list").innerHTML=state.scenes.map(function(s,i){
      return '<article class="prod-scene" data-scene="'+i+'">'+
        '<div class="prod-scene-head"><div><strong>المشهد '+(i+1)+'</strong> <small>'+(i===0?'افتتاح مشوّق':i===1?'توضيح المشكلة':i===2?'المساعدة المهنية':'النتيجة والختام')+'</small></div><span class="prod-icon-bubble" data-scene-time="'+i+'">'+s.start+'–'+s.end+' ث</span></div>'+
        '<div class="prod-scene-inner">'+
        '<label for="p-visual-'+i+'">ماذا يحدث بالصورة؟</label><textarea id="p-visual-'+i+'" data-scene-edit="visual" data-idx="'+i+'">'+escapeHTML(s.visual)+'</textarea>'+
        '<label for="p-overlay-'+i+'">النص العربي على الشاشة</label><input id="p-overlay-'+i+'" data-scene-edit="overlay" data-idx="'+i+'" value="'+escapeHTML(s.overlay)+'" maxlength="180">'+
        '<label for="p-camera-'+i+'">إخراج الكاميرا والانتقال</label><textarea id="p-camera-'+i+'" data-scene-edit="camera" data-idx="'+i+'">'+escapeHTML(s.camera)+'</textarea>'+
        '<div class="prod-scene-tools"><button type="button" class="btn alt" data-prod-action="copy-image" data-idx="'+i+'">نسخ أمر الصورة</button>'+
        '<button type="button" class="btn alt" data-prod-action="copy-video" data-idx="'+i+'">نسخ أمر الفيديو</button></div>'+
        '<details class="prod-prompt-details"><summary>معاينة أوامر هذا المشهد</summary><h4>أمر الصورة الثابتة</h4>'+
        '<textarea readonly data-img-preview="'+i+'" aria-label="أمر صورة المشهد '+(i+1)+'"></textarea>'+
        '<h4>أمر تحريك المشهد</h4><textarea readonly data-vid-preview="'+i+'" aria-label="أمر فيديو المشهد '+(i+1)+'"></textarea></details>'+
        '</div></article>';
    }).join("");
    drawHeader();
    updateAllPrompts();
  }
  function updateAllPrompts() {
    if (!state) return;
    state.scenes.forEach(function(s,i){
      var el=$("p-shot-list").querySelector('[data-img-preview="'+i+'"]');
      var vl=$("p-shot-list").querySelector('[data-vid-preview="'+i+'"]');
      if (el) el.value=imagePrompt(i);
      if (vl) vl.value=videoPrompt(i);
    });
  }
  function storyboardText() {
    sync();
    var c=state.config;
    return "استوديو أبو الفيصل — خطة ريلز\n"+
      "العنوان: "+state.title+"\nالخدمة: "+($("p-service").selectedOptions[0].text)+"\n"+
      "الجمهور: مسافرون يمنيون وأسر وطلاب بحسب موضوع الإعلان\n"+
      "المنصة: "+(PLATFORMS[c.platform]||"Instagram Reels")+"\nالمدة: "+c.duration+" ثانية | 9:16\n"+
      "الهدف: "+(GOALS[c.goal]||GOALS.trust)+"\nالافتتاح: "+state.hook+"\n"+
      "المشكلة: "+state.problem+"\nالحل: "+state.action+"\nالنتيجة: "+state.result+"\n"+
      "الملامح المستمرة: "+state.character+"\n"+
      (c.brief?"تعليمات خاصة: "+c.brief+"\n":"")+"\n"+
      state.scenes.map(function(s,i){return "المشهد "+(i+1)+" | "+s.start+"–"+s.end+" ثانية\nالصورة: "+s.visual+"\nالعبارة: "+s.overlay+"\nالكاميرا: "+s.camera;}).join("\n\n")+"\n\n"+
      "النهاية: أبو الفيصل للسفريات والسياحة | "+(c.cta||"أرسل وجهتك وموعدك لنوضح لك الخيارات")+"\n"+
      "التواصل: +967 771 974 697 | +967 781 478 444 | 02 367 697\n"+
      "الهوية: "+IDENTITY+"\nالقيود: "+NEGATIVE+"\n"+
      "لا تُذكر أسعار أو مواعيد أو موافقات غير متحققة.";
  }
  function productionPack() {
    var c=state.config;
    return storyboardText()+"\n\n"+
      "======== توجيه الإنتاج النهائي ========\n"+
      "أنت مخرج إعلانات محترف. استخدم القصة أعلاه من البداية إلى النهاية، لا مشاهد عشوائية. حافظ على الشخصيات والملابس والضوء والموقع. الموسيقى فقط دون حوار أو تعليق. أضف النصوص العربية في التحرير وليس داخل الصور المولدة. لا تدعِ توليد فيديو إذا لم تتوفر أداة فيديو فعلية. أنشئ أوامر منفصلة لكل مشهد، ثم اقترح تسلسل تجميع بنبرة "+(STYLES[c.style]||STYLES.cinematic)+"\n\n"+
      state.scenes.map(function(s,i){return "======== المشهد "+(i+1)+" : صورة ========\n"+imagePrompt(i)+"\n\n======== المشهد "+(i+1)+" : فيديو ========\n"+videoPrompt(i);}).join("\n\n")+
      "\n\n======== تعليمات المونتاج ========\n"+
      "جمّع المقاطع بالترتيب، اضبط كل مقطع على الثواني المحددة، أضف الموسيقى المرخّصة والنصوص العربية بوضوح، وأدرج بطاقة ختامية كحلية بنفسجية وذهبية في آخر ثانيتين. صدّر 1080×1920، 30fps، MP4 عند توفر برنامج المونتاج.";
  }
  function copyText(t) {
    function legacy() {
      var el=document.createElement("textarea");
      el.value=t; el.setAttribute("readonly","");
      el.style.position="fixed";el.style.opacity="0";
      document.body.appendChild(el);el.select();
      var ok=false;try{ok=document.execCommand("copy")}catch(e){}
      el.remove();
      notice(ok?"تم النسخ إلى الحافظة":"تعذّر النسخ؛ يمكنك تحديد النص من معاينة المشهد");
    }
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(t).then(function(){notice("تم النسخ إلى الحافظة")}).catch(legacy);
    } else legacy();
  }
  function notice(s) {
    var el=$("p-status");el.textContent=s;
    el.setAttribute("role","status");
  }
  function saveDraft(show) {
    if (!state) return;
    sync();
    try {
      localStorage.setItem(STORAGE,JSON.stringify(state));
      if(show) notice("تم حفظ المشروع داخل متصفح هذا الجوال فقط");
    } catch(e) {
      if(show) notice("تعذّر الحفظ على هذا المتصفح؛ استخدم تنزيل ملف المشروع");
    }
  }
  function download(filename,text,type) {
    var blob=new Blob([text],{type:type||"text/plain;charset=utf-8"});
    var link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download=filename;
    document.body.appendChild(link);
    link.click(); link.remove();
    setTimeout(function(){URL.revokeObjectURL(link.href)},10000);
    notice("تم تجهيز ملف التنزيل");
  }
  function handleAction(action,idx){
    sync();
    if(action==="copy-image"){copyText(imagePrompt(idx));return;}
    if(action==="copy-video"){copyText(videoPrompt(idx));return;}
    if(action==="copy-plan"){copyText(storyboardText());return;}
    if(action==="copy-all"){copyText(productionPack());return;}
    if(action==="export-txt"){download("abu-alfaisal-ad-production.txt",productionPack());return;}
    if(action==="export-json"){download("abu-alfaisal-ad-project.json",JSON.stringify(state,null,2),"application/json;charset=utf-8");return;}
    if(action==="save"){saveDraft(true);return;}
    if(action==="new"){
      if(dirty && !window.confirm("سيُستبدل نص المشاهد الذي عدّلته. هل تريد إنشاء السيناريو مجددًا؟")) return;
      buildNew();notice("تم تجهيز سيناريو جديد مترابط");return;
    }
  }
  function init(){
    var restored=null;
    try{restored=JSON.parse(localStorage.getItem(STORAGE)||"null");}catch(e){}
    if(restored && restored.scenes && restored.scenes.length===4 && restored.config && PRESETS[restored.config.service] &&
       restored.scenes.every(function(s){return typeof s.visual==="string" && typeof s.overlay==="string" && typeof s.camera==="string";})){
      fillForm(restored.config);
      state=restored;
      sync();draw();
      notice("استُعيد مشروعك المحفوظ على هذا الجهاز");
    } else buildNew();

    $("p-form").addEventListener("submit",function(e){e.preventDefault();handleAction("new");});
    ["p-service","p-duration","p-style","p-platform","p-goal"].forEach(function(id){
      $(id).addEventListener("change",function(){
        if(id==="p-service"){ $("p-title").value=PRESETS[$("p-service").value].title; }
        if(id==="p-service"){handleAction("new");}
        else {sync();saveDraft(false);}
      });
    });
    ["p-brief","p-cta","p-title"].forEach(function(id){
      $(id).addEventListener("change",function(){sync();saveDraft(false);});
    });
    $("p-shot-list").addEventListener("input",function(e){
      var el=e.target;
      if(!el.dataset.sceneEdit)return;
      var index=Number(el.dataset.idx),field=el.dataset.sceneEdit;
      if(!state.scenes[index])return;
      state.scenes[index][field]=el.value;
      dirty=true;updateAllPrompts();
    });
    $("p-shot-list").addEventListener("change",function(e){
      if(e.target.dataset.sceneEdit)saveDraft(false);
    });
    $("production").addEventListener("click",function(e){
      var target=e.target.closest("[data-prod-action]");
      if(!target)return;
      handleAction(target.dataset.prodAction, Number(target.dataset.idx || 0));
    });
    window.addEventListener("beforeunload",function(){try{saveDraft(false)}catch(e){}});
  }
  init();
})();
