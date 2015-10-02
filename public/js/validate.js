function validate(form, submitBtn, input1, input2) {
  var inputDivs = form+" .has-feedback",
  $inputDivs = $(inputDivs),
  $inputs = $(inputDivs+" input"),
  $submitBtn = $(submitBtn),
  $input1 = $(input1),
  $input2 = $(input2);

  $inputs.keyup(function(event) {
    $submitBtn.attr('disabled', true);
    if ($input1.val() === $input2.val() && $input1.val().length) {
      if (!$inputDivs.hasClass('has-success')) {
        $inputDivs.removeClass('has-error');
        $inputDivs.addClass('has-success');
        $(inputDivs+" span").remove();
        $inputDivs.append(success());
      }
      $submitBtn.removeAttr('disabled');
    }
    else {
      if (!$inputDivs.hasClass('has-error')) {
        $inputDivs.removeClass('has-success');
        $inputDivs.addClass('has-error');
        $(inputDivs+" span").remove();
        $inputDivs.append(failure());
      }
    }
  })
}

function success() {
  return '<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span><span class="sr-only">(success)</span>';
}

function failure() {
  return '<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span><span class="sr-only">(error)</span>';
}